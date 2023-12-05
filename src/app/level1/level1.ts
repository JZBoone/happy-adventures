import Phaser from "phaser";
import { map } from "./map";
import { AudioAsset } from "../common/audio";
import { ImageAsset } from "../common/image";
import { CastleAnimation, SpriteAsset } from "../common/sprite";
import { Level } from "../common/level";
import { disappearFriend, showLevelStartText } from "../common/helpers";
import { withAssets } from "../mixins/with-assets";
import { withMap } from "../mixins/with-map";
import { moveCoordinates } from "../common/map";
import { Movable } from "../common/movable";

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
  private friend!: Movable<Phaser.GameObjects.Image>;
  private castle!: Phaser.GameObjects.Sprite;
  private boat!: Movable<Phaser.GameObjects.Image>;
  private levelCompleted = false;

  private readonly WINNING_POSITION: [row: number, position: number] = [6, 4];

  constructor() {
    super({ key: Level.Level1 });
  }

  create() {
    super.create();
    this.resetLevel1();
    this.castle = this.createSprite(225, 280, SpriteAsset.Castle, 0);
    this.boat = this.createMovable({
      row: 10,
      position: 14,
      offsetY: -15,
      asset: ImageAsset.Boat,
    });

    this.friend = this.createMovable({
      row: 0,
      position: 0,
      asset: ImageAsset.Friend,
    });
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
    const [newRow, newPosition] = moveCoordinates(
      move,
      ...this.friend.coordinates()
    );
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
    if (groundType === ImageAsset.Water) {
      this.friend.move(row, position);
      this.boat.move(row, position);
      this.playAudio(AudioAsset.Splash);
    } else if (groundType === ImageAsset.Sand) {
      this.playAudio(AudioAsset.BoardBoat);
      this.friend.setOffsetY(0);
      this.friend.move(row, position);
    } else {
      this.handleInvalidMove();
    }
  }

  private handleOutOfWaterMove(row: number, position: number) {
    const groundType = map[row][position];
    if (groundType === ImageAsset.Sand) {
      this.friend.move(row, position);
      this.playAudio(AudioAsset.SandStep);
    } else if (
      groundType === ImageAsset.Water &&
      this.boat.isAt(row, position)
    ) {
      this.friend.setOffsetY(this.boat.offsetY * -1);
      this.friend.move(row, position);
      this.playAudio(AudioAsset.BoardBoat);
    } else {
      this.handleInvalidMove();
    }
  }

  private isInWater() {
    return this.friend.isAt(...this.boat.coordinates());
  }

  private resetLevel1() {
    this.levelCompleted = false;
  }

  private completeLevel() {
    const [row, position] = this.WINNING_POSITION;
    this.levelCompleted = true;
    this.castle.anims.play(CastleAnimation.Open);
    this.time.addEvent({
      delay: 500,
      callback: () => this.friend.move(row, position),
      loop: false,
    });
    this.time.addEvent({
      delay: 1_000,
      callback: () => disappearFriend(this, this.friend.movable),
      loop: false,
    });
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
