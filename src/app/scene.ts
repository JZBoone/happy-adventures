import Phaser from "phaser";
import { FloorTexture } from "./floor-texture";
import { map } from "./map";
import { Audio, AudioFiles } from "./audio";

export class Scene extends Phaser.Scene {
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  friend!: Phaser.GameObjects.Sprite;
  castle!: Phaser.GameObjects.Sprite;
  boat!: Phaser.GameObjects.Image;
  isInWater = false;
  levelOver = false;
  constructor() {
    super({ key: "scene" });
  }

  preload() {
    for (const [key, path] of Object.entries(AudioFiles)) {
      this.load.audio(key, path);
    }
    this.load.image(FloorTexture.Grass, "assets/grass.png");
    this.load.image(FloorTexture.Sand, "assets/sand.png");
    this.load.image(FloorTexture.Water, "assets/water.png");
    this.load.image("boat", "assets/boat.png");
    this.load.spritesheet("castle", "assets/castle.png", {
      frameWidth: 168,
      frameHeight: 139,
    });
    this.load.spritesheet("friend", "assets/friend.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
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
      const floorTexture = this.floorTextureAt(newFriendX, newFriendY);
      if (floorTexture === FloorTexture.Sand) {
        this.friend.x = newFriendX;
        this.friend.y = newFriendY;
        this.sound.play(Audio.SandStep);
      } else if (
        floorTexture === FloorTexture.Water &&
        this.boatAt(newFriendX, newFriendY)
      ) {
        this.isInWater = true;
        this.friend.x = newFriendX;
        this.friend.y = newFriendY - 15;
      } else {
        this.sound.play(Audio.Thump);
      }
    } else if (this.isInWater) {
      const floorTexture = this.floorTextureAt(newFriendX, newFriendY + 15);
      if (floorTexture === FloorTexture.Water) {
        this.sound.play(Audio.Splash);
        this.friend.x = newFriendX;
        this.friend.y = newFriendY;
        this.boat.x = this.boat.x + deltaX;
        this.boat.y = this.boat.y + deltaY;
      } else if (floorTexture === FloorTexture.Sand) {
        this.sound.play(Audio.SandStep);
        this.isInWater = false;
        this.friend.x = newFriendX;
        this.friend.y = newFriendY + 15;
      } else if (newFriendX === 225 && newFriendY === 310) {
        this.castle.anims.play("open");
        this.friend.setVisible(false);
        this.sound.play(Audio.Tada);
        this.levelOver = true;
      } else {
        this.sound.play(Audio.Thump);
      }
    }
  }

  create() {
    map.forEach((row, y) => {
      row.forEach((floorTexture, x) => {
        this.add.image(x * 50 + 25, y * 50 + 25, floorTexture);
      });
    });
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.castle = this.add.sprite(225, 280, "castle", 0);
    this.anims.create({
      key: "open",
      frames: this.anims.generateFrameNumbers("castle", {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: 0,
    });
    this.anims.create({
      key: "close",
      frames: this.anims.generateFrameNumbers("castle", {
        start: 3,
        end: 0,
      }),
      frameRate: 10,
      repeat: 0,
    });
    this.castle.on("animationstart", (anim: any) => {
      if (anim.key === "open") {
        this.sound.play(Audio.CastleOpen);
      }
    });
    this.boat = this.add.image(725, 540, "boat");
    this.friend = this.add.sprite(25, 25, "friend", 4);
  }

  private floorTextureAt(x: number, y: number): FloorTexture | null {
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
}
