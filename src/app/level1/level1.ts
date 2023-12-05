import Phaser from "phaser";
import { GroundType, map } from "./map";
import { AudioAsset } from "../audio";
import { ImageAsset } from "../image";
import { CastleAnimation, SpriteAsset } from "../sprite";
import { Level } from "../level";
import { showLevelStartText } from "../helpers";
import { withAssets } from "../mixins";

export class Level1 extends withAssets(Phaser.Scene, {
  audio: [
    AudioAsset.SandStep,
    AudioAsset.BoardBoat,
    AudioAsset.Thump,
    AudioAsset.Splash,
    AudioAsset.Tada,
    AudioAsset.CastleOpen,
  ] as const,
  images: [
    ImageAsset.Sand,
    ImageAsset.Water,
    ImageAsset.Boat,
    ImageAsset.Friend,
    ImageAsset.Forest,
  ] as const,
  sprites: [SpriteAsset.Castle] as const,
}) {
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  friend!: Phaser.GameObjects.Image;
  castle!: Phaser.GameObjects.Sprite;
  boat!: Phaser.GameObjects.Image;
  isInWater = false;
  levelOver = false;

  constructor() {
    super({ key: Level.Level1 });
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
        this.playAudio(AudioAsset.SandStep);
      } else if (
        groundType === ImageAsset.Water &&
        this.boatAt(newFriendX, newFriendY)
      ) {
        this.isInWater = true;
        this.friend.x = newFriendX;
        this.friend.y = newFriendY - 15;
        this.playAudio(AudioAsset.BoardBoat);
      } else {
        this.playAudio(AudioAsset.Thump);
      }
    } else if (this.isInWater) {
      const groundType = this.groundTypeAt(newFriendX, newFriendY + 15);
      if (groundType === ImageAsset.Water) {
        this.playAudio(AudioAsset.Splash);
        this.friend.x = newFriendX;
        this.friend.y = newFriendY;
        this.boat.x = this.boat.x + deltaX;
        this.boat.y = this.boat.y + deltaY;
      } else if (groundType === ImageAsset.Sand) {
        this.playAudio(AudioAsset.BoardBoat);
        this.isInWater = false;
        this.friend.x = newFriendX;
        this.friend.y = newFriendY + 15;
      } else if (newFriendX === 225 && newFriendY === 310) {
        this.levelOver = true;
        this.friend.setVisible(false);
        try {
          this.castle.anims.play(CastleAnimation.Open);
        } catch (e) {
          console.error("i knew it");
          console.error(e);
        }
        this.time.addEvent({
          delay: 1_500,
          callback: () => this.playAudio(AudioAsset.Tada),
          loop: false,
        });
        this.time.addEvent({
          delay: 3_000,
          callback: () => this.scene.start(Level.Level2),
          loop: false,
        });
      } else {
        this.playAudio(AudioAsset.Thump);
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
    this.castle = this.createSprite(225, 280, SpriteAsset.Castle, 0);
    this.boat = this.createImage(725, 540, ImageAsset.Boat);
    this.friend = this.createImage(25, 25, ImageAsset.Friend);
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
