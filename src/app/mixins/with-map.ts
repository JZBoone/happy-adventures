import Phaser from "phaser";
import { SceneClass } from "./common";
import { ImageAsset } from "../common/image";
import { AudioAsset } from "../common/audio";
import { loadMap, worldPosition } from "../common/map";

export type Move = "up" | "down" | "left" | "right";

export function withMap<TBase extends SceneClass>(
  Base: TBase,
  map: ImageAsset[][]
) {
  return class SceneWithMap extends Base {
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private __tweens = new Map<Phaser.GameObjects.Image, Phaser.Tweens.Tween>();

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
    move(
      scene: Phaser.Scene,
      object: Phaser.GameObjects.Image,
      place: {
        row: number;
        position: number;
        xOffset?: number;
        yOffset?: number;
      }
    ) {
      const { row, position, xOffset, yOffset } = place;
      const [x, y] = worldPosition({ row, position, xOffset, yOffset });
      this.__tweens.set(
        object,
        scene.tweens.add({
          targets: object,
          x,
          y,
          ease: "Linear",
          duration: 200,
          repeat: 0,
          yoyo: false,
        })
      );
    }
    getMove(): Move | null {
      for (const tween of this.__tweens.values()) {
        if (tween.isPlaying()) {
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
  };
}
