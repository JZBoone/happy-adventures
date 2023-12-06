import Phaser from "phaser";
import { map } from "./map";
import { AudioAsset } from "../common/audio";
import { ImageAsset } from "../common/image";
import { CastleAnimation, SpriteAsset } from "../common/sprite";
import { Level } from "../common/level";
import { disappearFriend, showLevelStartText } from "../common/helpers";
import { withAssets } from "../mixins/with-assets";
import { withMap } from "../mixins/with-map";
import { Movable } from "../common/movable";
import { Subject, debounceTime } from "rxjs";

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
  private castle!: Phaser.GameObjects.Sprite;
  private boat!: Movable<Phaser.GameObjects.Image>;
  private inValidMove$ = new Subject<void>();

  private readonly WINNING_POSITION: [row: number, position: number] = [6, 4];

  constructor() {
    super({ key: Level.Level1 });
  }

  create() {
    super.create();
    this.castle = this.createSprite(225, 280, SpriteAsset.Castle, 0);
    this.boat = this.createMovable({
      row: 10,
      position: 14,
      offsetY: -15,
      asset: ImageAsset.Boat,
    });

    showLevelStartText(this, 1);
    this.createFriend();
    this.moves$.subscribe(([row, position]) => this.handleMove(row, position));
    this.inValidMove$
      .asObservable()
      .pipe(debounceTime(50))
      .subscribe(() => {
        this.onInvalidMove();
      });
  }

  handleMove(newRow: number, newPosition: number): void {
    if (this.friend.isAt(...this.WINNING_POSITION)) {
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
      this.inValidMove$.next();
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
      this.inValidMove$.next();
    }
  }

  private isInWater() {
    return this.friend.isAt(...this.boat.coordinates());
  }

  private completeLevel() {
    const [row, position] = this.WINNING_POSITION;
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
