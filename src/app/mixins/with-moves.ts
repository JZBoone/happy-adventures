import Phaser from "phaser";
import { SceneClass } from "./common";

export type Move = "up" | "down" | "left" | "right";

export function withMoves<TBase extends SceneClass>(Base: TBase) {
  return class SceneWithMoves extends Base {
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    create() {
      this.cursors = this.input.keyboard!.createCursorKeys();
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
