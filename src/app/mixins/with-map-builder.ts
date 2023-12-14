import { Coordinates, ISceneWithMap } from "../types/map";
import { AudioAsset } from "../types/audio";
import { ImageAsset } from "../types/image";
import { SpriteAsset } from "../types/sprite";
import { Constructor } from "../types/util";
import {
  createMapImage,
  mapEditorSceneKey,
  mapTileSizePx,
  pointerCoordinates,
  saveMap,
} from "../common/map";
import { Subject, distinctUntilChanged } from "rxjs";
import { isEqual } from "lodash";
import { Level } from "../types/level";
import { toast } from "../common/helpers";
import { Movable } from "../common/movable";
import { Immovable } from "../common/immovable";

export const withMapBuilder = <
  SceneAudioAsset extends AudioAsset,
  SceneImageAsset extends ImageAsset,
  SceneSpriteAsset extends SpriteAsset,
  SceneImmovableImages extends Record<string, { asset: SceneImageAsset }>,
  SceneImmovableImageGroups extends Record<string, { asset: SceneImageAsset }>,
  SceneImmovableSprites extends Record<string, { asset: SceneSpriteAsset }>,
  SceneMovableImages extends Record<string, { asset: SceneImageAsset }>,
  SceneMovableSprites extends Record<string, { asset: SceneSpriteAsset }>,
>(
  LevelClass: Constructor<
    ISceneWithMap<
      SceneAudioAsset,
      SceneImageAsset,
      SceneSpriteAsset,
      SceneImmovableImages,
      SceneImmovableImageGroups,
      SceneImmovableSprites,
      SceneMovableImages,
      SceneMovableSprites
    >
  >,
  level: Level,
  groundTypes: readonly SceneImageAsset[]
) => {
  return class MapBuilder extends LevelClass {
    private selectedImageAsset!: SceneImageAsset;
    private mapImageAssets: readonly SceneImageAsset[] = groundTypes;
    private pointerIsDown = false;
    private changeCoordinates$ = new Subject<Coordinates>();
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private hotkey!: {
      /** s for save */
      s: Phaser.Input.Keyboard.Key;
      /** i for (zoom) in */
      i: Phaser.Input.Keyboard.Key;
      /** o for (zoom) out */
      o: Phaser.Input.Keyboard.Key;
      /** t + shift for (make) taller */
      t: Phaser.Input.Keyboard.Key;
      /** w + shift for (make) wider */
      w: Phaser.Input.Keyboard.Key;
      /** exit map builder and return to level */
      esc: Phaser.Input.Keyboard.Key;
      /** used in combination with other hotkeys */
      shift: Phaser.Input.Keyboard.Key;
    };
    private sceneObjectToMove:
      | Immovable<Phaser.GameObjects.Image>
      | Movable<Phaser.GameObjects.Image>
      | undefined;
    private _ready = false;

    constructor() {
      super({ key: mapEditorSceneKey(level) });
    }

    async create() {
      await super.create();
      this._ready = true;
      this.mapHeight = this.map.length * mapTileSizePx;
      this.mapWidth = this.map[0].length * mapTileSizePx;
      this.input.mouse!.disableContextMenu();
      this.selectedImageAsset = this.mapImageAssets[0];
      this.changeCoordinates$
        .pipe(distinctUntilChanged(isEqual))
        .subscribe((coordinates) => {
          if (this.sceneObjectToMove) {
            this.moveSceneObject(coordinates);
          } else {
            this.changeMapImage(coordinates);
          }
        });
      this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        this.handlePointerDown(pointer);
      });
      this.input.on("pointerup", () => {
        this.pointerIsDown = false;
      });
      this.input.on("pointerout", () => {
        this.pointerIsDown = false;
      });
      this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
        if (this.pointerIsDown) {
          this.changeCoordinates$.next(
            pointerCoordinates(pointer, this.cameras.main)
          );
        }
      });
      this.cursors = this.input.keyboard!.createCursorKeys();
      this.hotkey = {
        s: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        i: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.I),
        o: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.O),
        t: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.T),
        w: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        esc: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
        shift: this.input.keyboard!.addKey(
          Phaser.Input.Keyboard.KeyCodes.SHIFT
        ),
      };
      this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
      this.cameras.main.setZoom(1);
      this.cameras.main.setScroll(0, 0);
      this.cameras.main.useBounds = true;
    }

    async update() {
      if (!this._ready) {
        return;
      }
      this.maybeGrowMap();
      this.maybeShiftCamera();
      this.maybePrintMap();
      this.maybeZoom();
      this.maybeLaunchLevel();
    }

    private maybeZoom() {
      const zoomAmount = 0.1;
      const minZoom = 0.3;
      const maxZoom = 1;
      let newZoom: number | undefined;
      if (Phaser.Input.Keyboard.JustDown(this.hotkey.i)) {
        newZoom = this.cameras.main.zoom + zoomAmount;
      } else if (Phaser.Input.Keyboard.JustDown(this.hotkey.o)) {
        newZoom = this.cameras.main.zoom - zoomAmount;
      }
      if (newZoom !== undefined && newZoom >= minZoom && newZoom <= maxZoom) {
        this.cameras.main.setZoom(newZoom);
      }
    }

    private async maybePrintMap() {
      if (Phaser.Input.Keyboard.JustDown(this.hotkey.s)) {
        try {
          await saveMap(
            level,
            this.map.map((row) => row.map((position) => position.asset))
          );
          toast(this, "Saved map.");
        } catch (e) {
          toast(this, "Oops! Could not save map.");
          console.error("Error saving map", e);
        }
      }
    }

    private maybeShiftCamera() {
      const cameraSpeed = 5; // Speed of the camera movement
      const cam = this.cameras.main;
      if (this.cursors.up.isDown && cam.scrollY > 0) {
        cam.scrollY = Math.max(cam.scrollY - cameraSpeed, 0);
      } else if (
        this.cursors.down.isDown &&
        cam.scrollY < this.mapHeight - cam.height
      ) {
        cam.scrollY = Math.min(
          cam.scrollY + cameraSpeed,
          this.mapHeight - cam.height
        );
      } else if (
        this.cursors.right.isDown &&
        cam.scrollX < this.mapWidth - cam.width
      ) {
        cam.scrollX = Math.min(
          cam.scrollX + cameraSpeed,
          this.mapWidth - cam.width
        );
      } else if (this.cursors.left.isDown && cam.scrollX > 0) {
        cam.scrollX = Math.max(cam.scrollX - cameraSpeed, 0);
      }
    }

    private maybeGrowMap() {
      if (
        Phaser.Input.Keyboard.JustUp(this.hotkey.t) &&
        this.hotkey.shift.isDown
      ) {
        this.makeMapTaller(groundTypes[0]);
        this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
      } else if (
        Phaser.Input.Keyboard.JustUp(this.hotkey.w) &&
        this.hotkey.shift.isDown
      ) {
        this.makeMapWider(groundTypes[0]);
        this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
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

    private moveSceneObject(coordinates: Coordinates) {
      this.sceneObjectToMove!.move(coordinates);
    }

    private handlePointerDown(pointer: Phaser.Input.Pointer) {
      const [row, position] = pointerCoordinates(pointer, this.cameras.main);
      if ((pointer.event as MouseEvent).shiftKey) {
        console.info(row, position);
        toast(this, `${row}, ${position}`, 2_000);
      }
      if (!this.map[row][position]) {
        console.error(
          `Out of bounds pointerdown: x: ${pointer.x} y: ${pointer.y} row: ${row} position: ${position}`
        );
        return;
      }
      this.sceneObjectToMove = this.sceneObjectAt([row, position]);
      if (this.sceneObjectToMove) {
        this.pointerIsDown = true;
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

    private maybeLaunchLevel() {
      if (Phaser.Input.Keyboard.JustUp(this.hotkey.esc)) {
        this.scene.start(level);
      }
    }

    private sceneObjectAt(coordinates: Coordinates) {
      const sceneObjects = [
        ...Object.values(this.immovableImages),
        ...Object.values(this.immovableImageGroups).flatMap((group) => group),
        ...Object.values(this.immovableSprites),
        ...Object.values(this.movableImages),
        ...Object.values(this.movableSprites),
      ];
      return sceneObjects.find((object) => object.occupies(coordinates));
    }
  };
};
