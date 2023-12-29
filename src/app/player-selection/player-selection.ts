import Phaser from "phaser";
import { Scene } from "../types/scene";
import { loadImages } from "../common/assets";
import { ImageAsset } from "../types/image";
import { PlayerStorageKey } from "../types/player";

export class PlayerSelection extends Phaser.Scene {
  constructor() {
    super({
      key: Scene.CharacterSelection,
    });
  }

  preload() {
    loadImages(this, [ImageAsset.Friend, ImageAsset.CuteSpider]);
  }

  create() {
    this.makeHeading();
    this.makeOptions();
  }

  private makeHeading() {
    this.add
      .text(this.cameras.main.centerX, 120, "Select Your Player", {
        font: "64px Arial",
      })
      .setOrigin(0.5, 0.5);
  }

  private makeOptions() {
    const options = [
      { offsetX: -100, image: ImageAsset.Friend },
      { offsetX: 100, image: ImageAsset.CuteSpider },
    ];
    for (const { offsetX, image } of options) {
      const phaserImage = this.add.image(
        this.cameras.main.centerX - offsetX,
        this.cameras.main.centerY,
        image
      );
      phaserImage.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, phaserImage.width, phaserImage.height),
        Phaser.Geom.Rectangle.Contains
      );
      phaserImage.on("pointerdown", () => {
        this.selectPlayer(image);
      });
    }
  }

  private selectPlayer(player: ImageAsset) {
    localStorage.setItem(PlayerStorageKey, player);
    this.scene.start(Scene.Level1);
  }
}
