import Phaser from "phaser";
import { GroundType } from "../ground";
import { map } from "./map";
import { AudioAsset, AudioAssets } from "../audio";
import { ImageAsset, ImageAssets } from "../image";
import { SpriteAsset, SpriteAssets } from "../sprite";
import { Level } from "../level";
import { showLevelStartText } from "../level-text";

export class Level1 extends Phaser.Scene {
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  friend!: Phaser.GameObjects.Image;
  castle!: Phaser.GameObjects.Sprite;
  boat!: Phaser.GameObjects.Image;
  isInWater = false;
  levelOver = false;
  constructor() {
    super({ key: Level.Level1 });
  }

  preload() {
    for (const [key, path] of Object.entries(AudioAssets)) {
      this.load.audio(key, path);
    }
    for (const [key, path] of Object.entries(ImageAssets)) {
      this.load.image(key, path);
    }
    for (const [key, config] of Object.entries(SpriteAssets)) {
      this.load.spritesheet(key, config.path, config.frameConfig);
    }
  }

  update() {
    if (this.levelOver) {
      return;
    }
    let deltaX: number = 0;
    let deltaY: number = 0;
    if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      deltaY = 50;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      deltaX = 50;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      deltaY = -50;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      deltaX = -50;
    }
    if (deltaX === 0 && deltaY === 0) {
      return;
    }
    const newFriendX = this.friend.x + deltaX;
    const newFriendY = this.friend.y + deltaY;
    if (!this.isInWater) {
      const groundType = this.groundTypeAt(newFriendX, newFriendY);
      if (groundType === ImageAsset.Sand) {
        this.friend.x = newFriendX;
        this.friend.y = newFriendY;
        this.sound.play(AudioAsset.SandStep);
      } else if (
        groundType === ImageAsset.Water &&
        this.boatAt(newFriendX, newFriendY)
      ) {
        this.isInWater = true;
        this.friend.x = newFriendX;
        this.friend.y = newFriendY - 15;
        this.sound.play(AudioAsset.BoardBoat);
      } else {
        this.sound.play(AudioAsset.Thump);
      }
    } else if (this.isInWater) {
      const groundType = this.groundTypeAt(newFriendX, newFriendY + 15);
      if (groundType === ImageAsset.Water) {
        this.sound.play(AudioAsset.Splash);
        this.friend.x = newFriendX;
        this.friend.y = newFriendY;
        this.boat.x = this.boat.x + deltaX;
        this.boat.y = this.boat.y + deltaY;
      } else if (groundType === ImageAsset.Sand) {
        this.sound.play(AudioAsset.BoardBoat);
        this.isInWater = false;
        this.friend.x = newFriendX;
        this.friend.y = newFriendY + 15;
      } else if (newFriendX === 225 && newFriendY === 310) {
        this.levelOver = true;
        this.friend.setVisible(false);
        this.castle.anims.play("open");
        this.time.addEvent({
          delay: 1_500,
          callback: () => this.sound.play(AudioAsset.Tada),
          loop: false,
        });
        this.time.addEvent({
          delay: 3_000,
          callback: () => this.scene.start(Level.Level2),
          loop: false,
        });
      } else {
        this.sound.play(AudioAsset.Thump);
      }
    }
  }

  create() {
    this.resetLevel1();
    map.forEach((row, y) => {
      row.forEach((groundType, x) => {
        this.add.image(x * 50 + 25, y * 50 + 25, groundType);
      });
    });
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.castle = this.add.sprite(225, 280, SpriteAsset.Castle, 0);
    if (!this.anims.exists("open")) {
      this.anims.create({
        key: "open",
        frames: this.anims.generateFrameNumbers(SpriteAsset.Castle, {
          start: 0,
          end: 6,
        }),
        frameRate: 15,
        repeat: 0,
      });
      this.anims.create({
        key: "close",
        frames: this.anims.generateFrameNumbers(SpriteAsset.Castle, {
          start: 6,
          end: 0,
        }),
        frameRate: 15,
        repeat: 0,
      });
    }
    this.castle.on("animationstart", (anim: any) => {
      if (anim.key === "open") {
        this.sound.play(AudioAsset.CastleOpen);
      }
    });
    this.boat = this.add.image(725, 540, ImageAsset.Boat);
    this.friend = this.add.image(25, 25, ImageAsset.Friend);
    showLevelStartText(this, 1);
  }

  private groundTypeAt(x: number, y: number): GroundType | null {
    const index = (xOrY: number) => {
      if (xOrY === 25) {
        return 0;
      }
      return (xOrY - 25) / 50;
    };
    return map[index(y)]?.[index(x)] || null;
  }

  private boatAt(x: number, y: number): boolean {
    return this.boat.x === x && this.boat.y === y + 15;
  }

  private resetLevel1() {
    this.isInWater = false;
    this.levelOver = false;
  }
}
