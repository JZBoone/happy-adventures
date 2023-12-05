import Phaser from "phaser";
import { GroundType, boneCoordinates, heartCoordinates, map } from "./map";
import { AudioAsset } from "../audio";
import { ImageAsset } from "../image";
import { Level } from "../level";
import { disappearFriend, showLevelStartText } from "../helpers";
import { Level2Data } from "../level2/data";
import { withAssets } from "../mixins/with-assets";

export class Level3 extends withAssets(Phaser.Scene, {
  images: [
    ImageAsset.Goo,
    ImageAsset.Heart,
    ImageAsset.Lungs,
    ImageAsset.Bones,
    ImageAsset.Elasmosaurus,
    ImageAsset.SmallElasmosaurus,
    ImageAsset.Friend,
    ImageAsset.Bomb,
  ],
  audio: [
    AudioAsset.Grunt,
    AudioAsset.Explosion,
    AudioAsset.Tada,
    AudioAsset.Crunch,
    AudioAsset.Splat,
  ],
}) {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private friend!: Phaser.GameObjects.Image;
  private bomb!: Phaser.GameObjects.Image;
  private heart!: Phaser.GameObjects.Image;
  private isCarryingBomb = false;

  constructor() {
    super({ key: Level.Level3 });
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
        this.createImage(x * 50 + 25, y * 50 + 25, groundType);
      });
    });
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.heart = this.createImage(600, 100, ImageAsset.Heart);
    this.createImage(250, 130, ImageAsset.Lungs);
    this.createImage(150, 430, ImageAsset.Bones);
    this.createImage(570, 330, ImageAsset.Bones);
    this.createImage(500, 430, ImageAsset.Elasmosaurus);
    this.createImage(500, 570, ImageAsset.SmallElasmosaurus);
    this.friend = this.createImage(25, 25, ImageAsset.Friend);
    this.bomb = this.createImage(75, 550, ImageAsset.Bomb);
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

  private moveFriend(
    x: number,
    y: number,
    groundType: GroundType,
    objects: { isBones: boolean; isHeart: boolean }
  ) {
    if (x === 75 && y === 575 && !this.isCarryingBomb) {
      this.isCarryingBomb = true;
      this.playAudio(AudioAsset.Grunt);
    } else if (this.isCarryingBomb && objects.isHeart) {
      this.playAudio(AudioAsset.Explosion);
      this.heart.setVisible(false);
      this.bomb.setVisible(false);
      disappearFriend(this, this.friend);
      this.time.addEvent({
        delay: 2_000,
        callback: () => this.playAudio(AudioAsset.Tada),
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
          this.playAudio(AudioAsset.Crunch);
        } else {
          this.playAudio(AudioAsset.Splat);
        }
        if (this.isCarryingBomb) {
          this.moveBomb();
        }
        break;
    }
  }
}
