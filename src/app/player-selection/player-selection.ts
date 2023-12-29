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
    this.add
      .text(this.cameras.main.centerX, 120, "Select Your Player", {
        font: "64px Arial",
      })
      .setOrigin(0.5, 0.5);
    const friend = this.add.image(
      this.cameras.main.centerX - 100,
      this.cameras.main.centerY,
      ImageAsset.Friend
    );
    friend.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, friend.width, friend.height),
      Phaser.Geom.Rectangle.Contains
    );
    friend.on("pointerdown", () => {
      this.selectPlayer(ImageAsset.Friend);
    });
    const cuteSpider = this.add.image(
      this.cameras.main.centerX + 100,
      this.cameras.main.centerY,
      ImageAsset.CuteSpider
    );
    cuteSpider.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, cuteSpider.width, cuteSpider.height),
      Phaser.Geom.Rectangle.Contains
    );
    cuteSpider.on("pointerdown", () => {
      this.selectPlayer(ImageAsset.CuteSpider);
    });
  }

  private selectPlayer(player: ImageAsset) {
    localStorage.setItem(PlayerStorageKey, player);
    this.scene.start(Scene.Level1);
  }
}
