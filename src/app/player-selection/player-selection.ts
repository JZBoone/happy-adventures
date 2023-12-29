import Phaser from "phaser";
import { Scene } from "../types/scene";
import { loadImages } from "../common/assets";
import { ImageAsset, defaultImages } from "../types/image";
import { PlayerStorageKey } from "../types/player";

export class PlayerSelection extends Phaser.Scene {
  constructor() {
    super({
      key: Scene.CharacterSelection,
    });
  }

  preload() {
    loadImages(this, defaultImages);
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
    const options: { offsetX: number; image: ImageAsset; name: string }[] = [
      { offsetX: -450, image: ImageAsset.Friend, name: "Bad Bunny" },
      { offsetX: -150, image: ImageAsset.CuteSpider, name: "Schneider Spider" },
      { offsetX: 150, image: ImageAsset.OompaBall, name: "Bob" },
      { offsetX: 450, image: ImageAsset.ToddieTitan, name: "Toddie Titan" },
    ];
    for (const { offsetX, image, name } of options) {
      const phaserImage = this.add.image(
        this.cameras.main.centerX - offsetX,
        this.cameras.main.centerY,
        image
      );
      phaserImage.setScale(2);
      phaserImage.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, phaserImage.width, phaserImage.height),
        Phaser.Geom.Rectangle.Contains
      );
      phaserImage.on("pointerdown", () => {
        this.selectPlayer(image);
      });
      this.add
        .text(
          this.cameras.main.centerX - offsetX,
          this.cameras.main.centerY - 100,
          name,
          {
            font: "32px Arial",
          }
        )
        .setOrigin(0.5, 0.5);
    }
  }

  private selectPlayer(player: ImageAsset) {
    localStorage.setItem(PlayerStorageKey, player);
    this.scene.start(Scene.Level1);
  }
}
