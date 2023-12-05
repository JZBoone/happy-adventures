import Phaser from "phaser";
import { SceneClass } from "./common";
import { ImageAsset } from "../common/image";
import { AudioAsset } from "../common/audio";
import { loadMap } from "../common/map";

export type Move = "up" | "down" | "left" | "right";

export function withMap<TBase extends SceneClass>(
  Base: TBase,
  map: ImageAsset[][]
) {
  return class SceneWithMap extends Base {
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
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
      if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
        return "down";
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
        return "right";
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
        return "up";
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
        return "left";
      }
      return null;
    }
  };
}
