import Phaser from "phaser";
import { map } from "./map";
import { AudioAsset } from "../audio";
import { ImageAsset } from "../image";
import { CastleAnimation, SpriteAsset } from "../sprite";
import { Level } from "../level";
import {
  mapCoordinates,
  worldPosition,
  moveCoordinates,
  showLevelStartText,
  loadMap,
} from "../helpers";
import { withAssets } from "../mixins/with-assets";
import { withMap } from "../mixins/with-map";

export class Level1 extends withMap(
  withAssets(Phaser.Scene, {
    audio: [
      AudioAsset.SandStep,
      AudioAsset.BoardBoat,
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
  }),
  map
) {
  private friend!: Phaser.GameObjects.Image;
  private castle!: Phaser.GameObjects.Sprite;
  private boat!: Phaser.GameObjects.Image;
  private levelCompleted = false;
  private boatYOffset = 15;

  private readonly WINNING_POSITION: [row: number, position: number] = [6, 4];

  constructor() {
    super({ key: Level.Level1 });
  }

  create() {
    super.create();
    this.resetLevel1();
    this.castle = this.createSprite(225, 280, SpriteAsset.Castle, 0);
    this.boat = this.createImage(
      ...worldPosition({ row: 10, position: 14, yOffset: this.boatYOffset }),
      ImageAsset.Boat
    );
    this.friend = this.createImage(
      ...worldPosition({ row: 0, position: 0 }),
      ImageAsset.Friend
    );
    showLevelStartText(this, 1);
  }

  update() {
    if (this.levelCompleted) {
      return;
    }
    const move = this.getMove();
    if (!move) {
      return;
    }
    const [row, position] = mapCoordinates({
      x: this.friend.x,
      y: this.friend.y,
      yOffset: this.isInWater() ? this.boatYOffset : 0,
    });
    const [newRow, newPosition] = moveCoordinates(move, row, position);
    if (this.moveIsOutOfBounds(newRow, newPosition)) {
      this.handleInvalidMove();
      return;
    }
    if (
      newRow === this.WINNING_POSITION[0] &&
      newPosition === this.WINNING_POSITION[1]
    ) {
      this.completeLevel();
      return;
    }
    if (!this.isInWater()) {
      this.handleOutOfWaterMove(newRow, newPosition);
    } else {
      this.handleInWaterMove(newRow, newPosition);
    }
  }

  private handleInWaterMove(row: number, position: number) {
    const groundType = map[row][position];
    const [newX, newY] = worldPosition({ row, position });
    if (groundType === ImageAsset.Water) {
      this.friend.x = newX;
      this.friend.y = newY - this.boatYOffset;
      this.boat.x = newX;
      this.boat.y = newY + this.boatYOffset;
      this.playAudio(AudioAsset.Splash);
    } else if (groundType === ImageAsset.Sand) {
      this.playAudio(AudioAsset.BoardBoat);
      this.friend.x = newX;
      this.friend.y = newY;
    } else {
      this.handleInvalidMove();
    }
  }

  private handleOutOfWaterMove(row: number, position: number) {
    const groundType = map[row][position];
    if (groundType === ImageAsset.Sand) {
      const [newX, newY] = worldPosition({ row, position });
      this.friend.x = newX;
      this.friend.y = newY;
      this.playAudio(AudioAsset.SandStep);
    } else if (groundType === ImageAsset.Water && this.boatAt(row, position)) {
      const [newX, newY] = worldPosition({ row, position });
      this.friend.x = newX;
      this.friend.y = newY - this.boatYOffset;
      this.playAudio(AudioAsset.BoardBoat);
    } else {
      this.handleInvalidMove();
    }
  }

  private isInWater() {
    return this.friend.y + this.boatYOffset * 2 === this.boat.y;
  }

  private boatAt(row: number, position: number): boolean {
    const [boatRow, boatPosition] = mapCoordinates({
      x: this.boat.x,
      y: this.boat.y,
      yOffset: this.boatYOffset * -1,
    });
    return row === boatRow && position === boatPosition;
  }

  private resetLevel1() {
    this.levelCompleted = false;
  }

  private completeLevel() {
    const [row, position] = this.WINNING_POSITION;
    const [newX, newY] = worldPosition({ row, position });
    this.friend.x = newX;
    this.friend.y = newY - this.boatYOffset;
    this.levelCompleted = true;
    this.friend.setVisible(false);
    this.castle.anims.play(CastleAnimation.Open);
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
  }
}
