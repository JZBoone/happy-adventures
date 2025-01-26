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
      .text(this.cameras.main.centerX, 50, "Happy Adventures", {
        font: "64px Arial",
      })
      .setOrigin(0.5, 0.5);
    this.add
      .text(this.cameras.main.centerX, 125, "Choose Your Player", {
        font: "48px Arial",
      })
      .setOrigin(0.5, 0.5);
  }

  private makeOptions() {
    const options: { image: ImageAsset; name: string }[] = [
      { image: ImageAsset.Friend, name: "Cutie Pie" },
      { image: ImageAsset.CuteSpider, name: "Schneider Spider" },
      { image: ImageAsset.OompaBall, name: "Bob" },
      { image: ImageAsset.ToddieTitan, name: "Toddie Titan" },
      { image: ImageAsset.MrRainbow, name: "Mr. Rainbow" },
      { image: ImageAsset.Snaggletooth, name: "Snaggletooth" },
      { image: ImageAsset.Bamboo, name: "Bamboo" },
      { image: ImageAsset.PooGuy, name: "Poo Guy" },
      { image: ImageAsset.Warewolf, name: "Boonewolf" },
    ];
    let row = 0;
    let position = 0;
    for (const { image, name } of options) {
      const imageY = 300 + row * 150;
      const offsetX = this.cameras.main.centerX + (450 - position * 300);
      const phaserImage = this.add.image(offsetX, imageY, image);
      phaserImage.setScale(1);
      phaserImage.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, phaserImage.width, phaserImage.height),
        Phaser.Geom.Rectangle.Contains
      );
      phaserImage.on("pointerdown", () => {
        this.selectPlayer(image);
      });
      this.add
        .text(offsetX, imageY - 70, name, {
          font: "32px Arial",
        })
        .setOrigin(0.5, 0.5);
      if (position >= 3) {
        position = 0;
        row++;
      } else {
        position++;
      }
    }
  }

  private selectPlayer(player: ImageAsset) {
    localStorage.setItem(PlayerStorageKey, player);
    this.scene.start(Scene.Instructions);
  }
}
