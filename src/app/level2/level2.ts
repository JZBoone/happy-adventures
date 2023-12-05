import Phaser from "phaser";
import { GroundType, groundTypes, map } from "./map";
import { AudioAsset } from "../audio";
import { ImageAsset } from "../image";
import { Level } from "../level";
import { disappearFriend, showLevelStartText } from "../helpers";
import { Level2Data } from "./data";
import { withAssets } from "../mixins";

export class Level2 extends withAssets(Phaser.Scene, {
  images: [
    ...groundTypes,
    ImageAsset.Monster,
    ImageAsset.Friend,
    ImageAsset.Portal,
  ],
  audio: [AudioAsset.Tada, AudioAsset.Chomp, AudioAsset.Fall, AudioAsset.Stomp],
}) {
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  friend!: Phaser.GameObjects.Image;
  monsterIsDead = false;
  constructor() {
    super({ key: Level.Level2 });
  }

  init(data: Level2Data) {
    if (data.monsterIsDead) {
      this.monsterIsDead = true;
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
    this.friend = this.createImage(25, 25, ImageAsset.Friend);
    if (!this.monsterIsDead) {
      this.createImage(650, 540, ImageAsset.Monster);
    }
    this.createImage(750, 540, ImageAsset.Portal);
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
    if (this.monsterIsDead && x === 725 && [525, 575].includes(y)) {
      this.playAudio(AudioAsset.Tada);
      this.time.addEvent({
        delay: 2_000,
        callback: () => this.scene.start(Level.Level4),
        loop: false,
      });
      this.friend.x = x;
      this.friend.y = y;
      disappearFriend(this, this.friend);
      return;
    }
    if (!this.monsterIsDead && x === 625 && [525, 575].includes(y)) {
      this.friend.x = x;
      this.friend.y = y;
      this.playAudio(AudioAsset.Chomp);
      disappearFriend(this, this.friend);
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
        this.playAudio(AudioAsset.Stomp);
        break;
      case ImageAsset.BlackHole:
        this.friend.x = x;
        this.friend.y = y;
        this.playAudio(AudioAsset.Fall);
        disappearFriend(this, this.friend);
        this.time.addEvent({
          delay: 2_000,
          callback: () => this.scene.start(Level.Level1),
          loop: false,
        });
        break;
    }
  }
}
