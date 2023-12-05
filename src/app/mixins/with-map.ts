import Phaser from "phaser";
import { ImageAsset } from "../common/image";
import { AudioAsset } from "../common/audio";
import { loadMap, worldPosition } from "../common/map";
import { Movable } from "../common/movable";
import { SpriteAsset } from "../common/sprite";
import { ISceneWithAssets } from "./with-assets";
import { Constructor } from "./common";

export type Move = "up" | "down" | "left" | "right";

interface IWithMap<
  SceneAudioAsset extends AudioAsset,
  SceneImageAsset extends ImageAsset,
  SceneSpriteAsset extends SpriteAsset,
> extends ISceneWithAssets<
    SceneAudioAsset,
    SceneImageAsset,
    SceneSpriteAsset
  > {}

export function withMap<
  SceneAudioAsset extends AudioAsset,
  SceneImageAsset extends ImageAsset,
  SceneSpriteAsset extends SpriteAsset,
>(
  Base: Constructor<
    ISceneWithAssets<SceneAudioAsset, SceneImageAsset, SceneSpriteAsset>
  >,
  map: ImageAsset[][]
) {
  return class SceneWithMap
    extends Base
    implements IWithMap<SceneAudioAsset, SceneImageAsset, SceneSpriteAsset>
  {
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private movables: Movable<
      Phaser.GameObjects.Image | Phaser.GameObjects.Sprite
    >[] = [];

    create() {
      loadMap(this, map);
      this.cursors = this.input.keyboard!.createCursorKeys();
    }

    moveIsOutOfBounds(newRow: number, newPosition: number): boolean {
      return (
        newRow < 0 ||
        newRow > map.length - 1 ||
        newPosition < 0 ||
        newPosition > map[0].length - 1
      );
    }

    handleInvalidMove() {
      this.sound.play(AudioAsset.Thump);
    }

    getMove(): Move | null {
      for (const movable of this.movables) {
        if (movable.isMoving()) {
          return null;
        }
      }
      if (this.cursors.up.isDown) {
        return "up";
      } else if (this.cursors.down.isDown) {
        return "down";
      } else if (this.cursors.right.isDown) {
        return "right";
      } else if (this.cursors.left.isDown) {
        return "left";
      }
      return null;
    }

    createMovable(params: {
      asset: SceneImageAsset | SceneSpriteAsset;
      row: number;
      position: number;
      offsetX?: number;
      offsetY?: number;
    }): Movable<Phaser.GameObjects.Image | Phaser.GameObjects.Sprite> {
      const { asset, row, position, offsetX, offsetY } = params;
      const isImage = this.images.includes(asset as SceneImageAsset);
      const isSprite = this.sprites.includes(asset as SceneSpriteAsset);
      if (!isImage && !isSprite) {
        throw new Error(
          `Movable asset not loaded. Did you forget to load ${asset}?`
        );
      }
      const [x, y] = worldPosition({ row, position, offsetX, offsetY });
      const createdAsset = isImage
        ? this.createImage(x, y, asset as ImageAsset)
        : this.createSprite(x, y, asset as SpriteAsset);
      const movable = new Movable(this, createdAsset, { offsetX, offsetY });
      this.movables.push(movable);
      return movable;
    }
  };
}
