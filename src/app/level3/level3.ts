import Phaser from "phaser";
import { GroundType } from "../ground";
import { boneCoordinates, heartCoordinates, map } from "./map";
import { AudioAsset, AudioAssets } from "../audio";
import { ImageAsset, ImageAssets } from "../image";
import { SpriteAsset, SpriteAssets } from "../sprite";
import { Level } from "../level";
import { showLevelStartText } from "../level-text";
import { Level2Data } from "../level2/data";

export class Level3 extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private friend!: Phaser.GameObjects.Sprite;
  private bomb!: Phaser.GameObjects.Image;
  private heart!: Phaser.GameObjects.Image;
  private isCarryingBomb = false;

  constructor() {
    super({ key: Level.Level3 });
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
    const [groundType, objects] = this.groundTypeAt(newFriendX, newFriendY);
    if (groundType) {
      this.moveFriend(newFriendX, newFriendY, groundType, objects);
    }
  }

  create() {
    map.forEach((row, y) => {
      row.forEach((groundType, x) => {
        this.add.image(x * 50 + 25, y * 50 + 25, groundType);
      });
    });
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.heart = this.add.image(600, 100, ImageAsset.Heart);
    this.add.image(250, 130, ImageAsset.Lungs);
    this.add.image(150, 430, ImageAsset.Bones);
    this.add.image(570, 330, ImageAsset.Bones);
    this.add.image(500, 430, ImageAsset.Elasmosaurus);
    this.add.image(500, 570, ImageAsset.SmallElasmosaurus);
    this.friend = this.add.sprite(25, 25, SpriteAsset.Friend, 4);
    this.bomb = this.add.image(75, 550, ImageAsset.Bomb);
    showLevelStartText(this, 3);
  }

  private groundTypeAt(
    x: number,
    y: number
  ): [GroundType | null, { isBones: boolean; isHeart: boolean }] {
    const index = (xOrY: number) => {
      if (xOrY === 25) {
        return 0;
      }
      return (xOrY - 25) / 50;
    };
    const isBones = boneCoordinates.some(
      ([_y, _x]) => index(y) === _y && index(x) === _x
    );
    const isHeart = heartCoordinates.some(
      ([_y, _x]) => index(y) === _y && index(x) === _x
    );
    return [map[index(y)]?.[index(x)] || null, { isBones, isHeart }];
  }

  private moveBomb() {
    this.bomb.y = this.friend.y - 30;
    this.bomb.x = this.friend.x;
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

  private moveFriend(
    x: number,
    y: number,
    groundType: GroundType,
    objects: { isBones: boolean; isHeart: boolean }
  ) {
    if (x === 75 && y === 575 && !this.isCarryingBomb) {
      this.isCarryingBomb = true;
      this.sound.play(AudioAsset.Grunt);
    } else if (this.isCarryingBomb && objects.isHeart) {
      this.sound.play(AudioAsset.Explosion);
      this.heart.setVisible(false);
      this.bomb.setVisible(false);
      this.disappearFriend();
      this.time.addEvent({
        delay: 2_000,
        callback: () => this.sound.play(AudioAsset.Tada),
        loop: false,
      });
      const data: Level2Data = { monsterIsDead: true };
      this.time.addEvent({
        delay: 4_000,
        callback: () => this.scene.start(Level.Level2, data),
        loop: false,
      });
    }
    switch (groundType) {
      case ImageAsset.Goo:
        this.friend.x = x;
        this.friend.y = y;
        if (objects.isBones) {
          this.sound.play(AudioAsset.Crunch);
        } else {
          this.sound.play(AudioAsset.Splat);
        }
        if (this.isCarryingBomb) {
          this.moveBomb();
        }
        break;
    }
  }
}
