import Phaser from "phaser";
import { Scene } from "../types/scene";
import { loadImages } from "../common/assets";
import { ImageAsset } from "../types/image";

export class Instructions extends Phaser.Scene {
  constructor() {
    super({
      key: Scene.Instructions,
    });
  }

  preload() {
    loadImages(this, [ImageAsset.ArrowKeys]);
  }

  create() {
    this.add
      .text(this.cameras.main.centerX, 100, "Use the Arrow Keys to Play", {
        font: "48px Arial",
      })
      .setOrigin(0.5, 0.5);
    this.add.image(this.cameras.main.centerX, 300, ImageAsset.ArrowKeys);
    this.input.keyboard!.on(
      "keydown",
      () => {
        this.scene.start(Scene.Level1);
      },
      this
    );
    this.add
      .text(this.cameras.main.centerX, 500, "Press Any Key To Start", {
        font: "48px Arial",
      })
      .setOrigin(0.5, 0.5);
  }
}
