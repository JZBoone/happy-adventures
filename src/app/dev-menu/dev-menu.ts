import Phaser from "phaser";
import { loadImages } from "../common/assets";
import { ImageAsset, defaultImages } from "../types/image";
import { PlayerStorageKey } from "../types/player";
import { Scene } from "../types/scene";
import { playerOptions } from "../player-selection/players";

// In play order. Named levels (the newer convention) show their name on the
// button; numbered levels show their number.
const LEVELS: Scene[] = [
  Scene.Level1,
  Scene.SwampMonster,
  Scene.Level2,
  Scene.Level3,
  Scene.Level4,
  Scene.Level5,
  Scene.Level6,
  Scene.Level7,
];

function levelButtonLabel(level: Scene): string {
  if (level.startsWith("level")) {
    return level.slice("level".length);
  }
  return level
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Dev-only entry scene (gated behind DEV_MODE_ENABLED in game.ts). Lets you
 * jump straight into any level for local testing, while still choosing the
 * player character. The selected player is persisted to localStorage under
 * PlayerStorageKey, the same key levels read in createFriend().
 */
export class DevMenu extends Phaser.Scene {
  private highlight?: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: Scene.DevMenu });
  }

  preload() {
    loadImages(this, defaultImages);
  }

  create() {
    this.makeHeading();
    this.makePlayerOptions();
    this.makeLevelButtons();
  }

  private makeHeading() {
    this.add
      .text(this.cameras.main.centerX, 40, "Dev Menu", {
        font: "64px Arial",
      })
      .setOrigin(0.5, 0.5);
    this.add
      .text(this.cameras.main.centerX, 100, "Pick a player, then pick a level", {
        font: "32px Arial",
      })
      .setOrigin(0.5, 0.5);
  }

  private makePlayerOptions() {
    const stored = localStorage.getItem(PlayerStorageKey);
    let row = 0;
    let position = 0;
    for (const { image, name } of playerOptions) {
      const imageY = 240 + row * 150;
      const offsetX = this.cameras.main.centerX + (450 - position * 300);
      const phaserImage = this.add.image(offsetX, imageY, image);
      phaserImage.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, phaserImage.width, phaserImage.height),
        Phaser.Geom.Rectangle.Contains
      );
      phaserImage.on("pointerdown", () => {
        this.selectPlayer(image, phaserImage);
      });
      this.add
        .text(offsetX, imageY - 70, name, {
          font: "32px Arial",
        })
        .setOrigin(0.5, 0.5);
      if (image === stored) {
        this.moveHighlightTo(phaserImage);
      }
      if (position >= 3) {
        position = 0;
        row++;
      } else {
        position++;
      }
    }
  }

  private makeLevelButtons() {
    const y = this.cameras.main.height - 80;
    const spacing = 120;
    const startX =
      this.cameras.main.centerX - (spacing * (LEVELS.length - 1)) / 2;
    this.add
      .text(this.cameras.main.centerX, y - 60, "Jump to level", {
        font: "32px Arial",
      })
      .setOrigin(0.5, 0.5);
    LEVELS.forEach((level, index) => {
      const x = startX + index * spacing;
      const button = this.add
        .rectangle(x, y, 90, 60, 0x4444aa)
        .setStrokeStyle(2, 0xffffff)
        .setInteractive({ useHandCursor: true });
      const label = levelButtonLabel(level);
      this.add
        .text(x, y, label, {
          font: label.length > 2 ? "16px Arial" : "32px Arial",
          align: "center",
          wordWrap: { width: 85 },
        })
        .setOrigin(0.5, 0.5);
      button.on("pointerdown", () => this.startLevel(level));
    });
  }

  private selectPlayer(player: ImageAsset, image: Phaser.GameObjects.Image) {
    localStorage.setItem(PlayerStorageKey, player);
    this.moveHighlightTo(image);
  }

  private moveHighlightTo(image: Phaser.GameObjects.Image) {
    if (!this.highlight) {
      this.highlight = this.add
        .rectangle(image.x, image.y, image.width + 16, image.height + 16)
        .setStrokeStyle(4, 0xffff00);
    } else {
      this.highlight.setPosition(image.x, image.y);
      this.highlight.setSize(image.width + 16, image.height + 16);
    }
  }

  private startLevel(level: Scene) {
    if (!localStorage.getItem(PlayerStorageKey)) {
      localStorage.setItem(PlayerStorageKey, ImageAsset.Friend);
    }
    this.scene.start(level);
  }
}
