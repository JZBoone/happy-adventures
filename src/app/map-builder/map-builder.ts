import { Coordinates, ISceneWithMap } from "../types/map";
import { AudioAsset } from "../types/audio";
import { ImageAsset } from "../types/image";
import { SpriteAsset } from "../types/sprite";
import { Constructor } from "../types/util";
import {
  createMapImage,
  mapTileSizePx,
  pointerCoordinates,
} from "../common/map";
import { Subject, distinctUntilChanged } from "rxjs";
import { isEqual } from "lodash";

export const mapBuilderFactory = <
  SceneAudioAsset extends AudioAsset,
  SceneImageAsset extends ImageAsset,
  SceneSpriteAsset extends SpriteAsset,
>(
  Level: Constructor<
    ISceneWithMap<SceneAudioAsset, SceneImageAsset, SceneSpriteAsset>
  >
) => {
  return class MapBuilder extends Level {
    private selectedImageAsset!: SceneImageAsset;
    private mapImageAssets: SceneImageAsset[] = [];
    private pointerIsDown = false;
    private changeCoordinates$ = new Subject<Coordinates>();
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private pKey!: Phaser.Input.Keyboard.Key;

    constructor() {
      super({ key: `${Level.name}MapBuilder` });
    }

    create() {
      super.create();
      this.input.mouse!.disableContextMenu();
      this.mapImageAssets = Array.from(
        new Set(
          this.map.flatMap((row) => row.map((position) => position.asset))
        )
      ) as SceneImageAsset[];
      this.selectedImageAsset = this.mapImageAssets[0];
      this.changeCoordinates$
        .pipe(distinctUntilChanged(isEqual))
        .subscribe((coordinates) => {
          this.changeMapImage(coordinates);
        });
      this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        this.handlePointerDown(pointer);
      });
      this.input.on("pointerup", () => {
        this.pointerIsDown = false;
      });
      this.input.on("pointermove", (pointer: { x: number; y: number }) => {
        if (this.pointerIsDown) {
          this.changeCoordinates$.next(pointerCoordinates(pointer));
        }
      });
      this.cursors = this.input.keyboard!.createCursorKeys();
      this.pKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    }

    update() {
      this.maybeShiftCamera();
      this.maybePrintMap();
    }

    private maybePrintMap() {
      if (Phaser.Input.Keyboard.JustDown(this.pKey)) {
        console.log(
          this.map.map((row) => row.map((position) => position.asset))
        );
      }
    }

    private maybeShiftCamera() {
      const cameraSpeed = 5; // Speed of the camera movement
      const cam = this.cameras.main;
      const worldWidth = this.map.length * mapTileSizePx;
      const worldHeight = this.map[0].length * mapTileSizePx;
      if (this.cursors.up.isDown && cam.scrollY > 0) {
        cam.scrollY = Math.max(cam.scrollY - cameraSpeed, 0);
      } else if (
        this.cursors.down.isDown &&
        cam.scrollY < worldHeight - cam.height
      ) {
        cam.scrollY = Math.min(
          cam.scrollY + cameraSpeed,
          worldHeight - cam.height
        );
      } else if (
        this.cursors.right.isDown &&
        cam.scrollX < worldWidth - cam.width
      ) {
        cam.scrollX = Math.min(
          cam.scrollX + cameraSpeed,
          worldWidth - cam.width
        );
      } else if (
        this.cursors.left.isDown &&
        cam.scrollY < worldHeight - cam.height
      ) {
        cam.scrollX = Math.max(cam.scrollX - cameraSpeed, 0);
      }
    }

    private changeMapImage(coordinates: Coordinates) {
      const [row, position] = coordinates;
      this.map[row][position].image.destroy();
      this.map[row][position].asset = this.selectedImageAsset;
      this.map[row][position].image = createMapImage(this, {
        asset: this.selectedImageAsset,
        coordinates: [row, position],
      });
    }

    private handlePointerDown(pointer: Phaser.Input.Pointer) {
      const [row, position] = pointerCoordinates(pointer);
      console.info(row, position);
      if (!this.map[row][position]) {
        console.error(
          `Out of bounds pointerdown: x: ${pointer.x} y: ${pointer.y} row: ${row} position: ${position}`
        );
        return;
      }
      if (pointer.rightButtonDown()) {
        const currentAsset = this.map[row][position].asset;
        const i = this.mapImageAssets.findIndex(
          (image) => image === currentAsset
        );
        this.selectedImageAsset = this.mapImageAssets[
          i === this.mapImageAssets.length - 1 ? 0 : i + 1
        ] as SceneImageAsset;
        this.changeMapImage([row, position]);
      } else {
        this.selectedImageAsset = this.map[row][position]
          .asset as SceneImageAsset;
        this.pointerIsDown = true;
        this.changeCoordinates$.next([row, position]);
      }
    }
  };
};
