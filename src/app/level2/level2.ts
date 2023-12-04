import Phaser from "phaser";
import { GroundType } from "../ground";
import { map } from "./map";
import { AudioAsset, AudioAssets } from "../audio";
import { ImageAsset, ImageAssets } from "../image";
import { SpriteAsset, SpriteAssets } from "../sprite";
import { Level } from "../level";
import { showLevelStartText } from "../level-text";
import { Level2Data } from "./data";

export class Level2 extends Phaser.Scene {
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  friend!: Phaser.GameObjects.Sprite;
  monsterIsDead = false;
  constructor() {
    super({ key: Level.Level2 });
  }

  init(data: Level2Data) {
    if (data.monsterIsDead) {
      this.monsterIsDead = true;
    }
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
    if (groundType) {
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
    if (!this.monsterIsDead) {
      this.add.image(650, 540, ImageAsset.Monster);
    }
    this.add.image(750, 540, ImageAsset.Portal);
    showLevelStartText(this, 2);
  }

  private disappearFriend() {
    this.tweens.add({
      targets: this.friend,
      scaleX: 0, // Scale horizontally to 0
      scaleY: 0, // Scale vertically to 0
      ease: "Linear", // Use a linear easing
      duration: 2000, // Duration of the tween in milliseconds
      onComplete: () => {
        this.friend.setVisible(false); // Hide the sprite after scaling down
      },
    });
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
    if (this.monsterIsDead && x === 725 && [525, 575].includes(y)) {
      this.sound.play(AudioAsset.Tada);
      this.time.addEvent({
        delay: 2_000,
        callback: () => this.scene.start(Level.Level4),
        loop: false,
      });
      this.friend.x = x;
      this.friend.y = y;
      this.disappearFriend();
      return;
    }
    if (!this.monsterIsDead && x === 625 && [525, 575].includes(y)) {
      this.friend.x = x;
      this.friend.y = y;
      this.sound.play(AudioAsset.Chomp);
      this.disappearFriend();
      this.time.addEvent({
        delay: 2_000,
        callback: () => this.scene.start(Level.Level3),
        loop: false,
      });
      return;
    }
    switch (groundType) {
      case ImageAsset.Stone:
        this.friend.x = x;
        this.friend.y = y;
        this.sound.play(AudioAsset.Stomp);
        break;
      case ImageAsset.BlackHole:
        this.friend.x = x;
        this.friend.y = y;
        this.sound.play(AudioAsset.Fall);
        this.disappearFriend();
        this.time.addEvent({
          delay: 2_000,
          callback: () => this.scene.start(Level.Level1),
          loop: false,
        });
        break;
    }
  }
}
