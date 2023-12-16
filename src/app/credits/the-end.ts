import Phaser from "phaser";
import { Level } from "../types/level";

export class TheEnd extends Phaser.Scene {
  constructor() {
    super({ key: Level.TheEnd });
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    this.add
      .text(centerX, centerY, "The End", {
        font: "48px Arial",
        align: "center",
      })
      .setOrigin(0.5, 0.5);
  }
}
