import Phaser from "phaser";
import { GroundType } from "../ground";
import { map } from "./map";
import { AudioAsset, AudioAssets } from "../audio";
import { ImageAsset, ImageAssets } from "../image";
import { SpriteAsset, SpriteAssets } from "../sprite";
import { Level } from "../level";
import { showLevelStartText } from "../level-text";

export class Level2 extends Phaser.Scene {
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  friend!: Phaser.GameObjects.Sprite;
  constructor() {
    super({ key: Level.Level2 });
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
    const groundType = this.groundTypeAt(newFriendX, newFriendY);
    if (groundType === ImageAsset.Stone) {
      this.moveFriend(newFriendX, newFriendY, groundType);
    }
  }

  create() {
    map.forEach((row, y) => {
      row.forEach((groundType, x) => {
        this.add.image(x * 50 + 25, y * 50 + 25, groundType);
      });
    });
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.friend = this.add.sprite(25, 25, SpriteAsset.Friend, 4);
    showLevelStartText(this, 2);
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

  private moveFriend(x: number, y: number, groundType: GroundType) {
    this.friend.x = x;
    this.friend.y = y;
    switch (groundType) {
      case ImageAsset.Stone:
        this.sound.play(AudioAsset.Stomp);
        break;
    }
  }
}
