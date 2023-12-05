import Phaser from "phaser";
import { GroundType, map } from "./map";
import { ImageAsset } from "../image";
import { Level } from "../level";
import { showLevelStartText } from "../helpers";
import { withAssets } from "../mixins";

export class Level4 extends withAssets(Phaser.Scene, {
  images: [ImageAsset.Friend, ImageAsset.Forest, ImageAsset.Tree],
}) {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private friend!: Phaser.GameObjects.Image;

  constructor() {
    super({ key: Level.Level4 });
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
        this.createImage(x * 50 + 25, y * 50 + 25, groundType);
      });
    });
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.friend = this.createImage(25, 25, ImageAsset.Friend);
    this.createImage(50, 50, ImageAsset.Tree);
    this.createImage(100, 100, ImageAsset.Tree);
    showLevelStartText(this, 4);
  }

  private groundTypeAt(x: number, y: number): GroundType | null {
    const index = (xOrY: number) => {
      if (xOrY === 25) {
        return 0;
      }
      return (xOrY - 25) / 50;
    };
    return map[index(y)]?.[index(x)];
  }

  private moveFriend(x: number, y: number, groundType: GroundType) {
    this.friend.x = x;
    this.friend.y = y;
  }
}
