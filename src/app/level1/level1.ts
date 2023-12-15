import Phaser from "phaser";
import { takeWhile } from "rxjs";
import { Level } from "../types/level";
import { showLevelStartText } from "../common/helpers";
import { withAssets } from "../mixins/with-assets";
import { withMap } from "../mixins/with-map";
import { AudioAsset } from "../types/audio";
import { ImageAsset } from "../types/image";
import { CastleAnimation, SpriteAsset } from "../types/sprite";
import { Coordinates } from "../types/map";

export class Level1MapAndAssets extends withMap(
  withAssets(Phaser.Scene, {
    audio: [
      AudioAsset.SandStep,
      AudioAsset.BoardBoat,
      AudioAsset.Splash,
      AudioAsset.CastleOpen,
    ] as const,
    images: [
      ImageAsset.Sand,
      ImageAsset.Water,
      ImageAsset.Boat,
      ImageAsset.Forest,
    ] as const,
    sprites: [SpriteAsset.Castle] as const,
  }),
  {
    level: Level.Level1,
    immovableSprites: {
      castle: { asset: SpriteAsset.Castle },
    } as const,
    movableImages: { boat: { asset: ImageAsset.Boat } } as const,
  }
) {}

export class Level1 extends Level1MapAndAssets {
  private levelCompleted = false;

  constructor() {
    super({ key: Level.Level1 });
  }

  async create() {
    await super.create();
    this.levelCompleted = false;

    showLevelStartText(this, 1);
    this.createFriend();
    this.moves$
      .pipe(takeWhile(() => !this.levelCompleted))
      .subscribe(({ coordinates }) => this.handleMove(coordinates));
  }

  handleMove(coordinates: Coordinates): void {
    if (this.immovableSprites.castle.isAt(coordinates)) {
      this.completeLevel();
      return;
    }
    if (!this.isInWater()) {
      this.handleOutOfWaterMove(coordinates);
    } else {
      this.handleInWaterMove(coordinates);
    }
  }

  private handleInWaterMove(coordinates: Coordinates) {
    const [row, position] = coordinates;
    const groundType = this.map[row][position].asset;
    if (groundType === ImageAsset.Water) {
      this.friend.move(coordinates);
      this.movableImages.boat.move(coordinates);
      this.playSound(AudioAsset.Splash, { volume: 0.25 });
    } else if (groundType === ImageAsset.Sand) {
      this.playSound(AudioAsset.BoardBoat);
      this.friend.setOffsetY(0);
      this.friend.move(coordinates);
    } else {
      this.invalidMoves$.next();
    }
  }

  private handleOutOfWaterMove(coordinates: Coordinates) {
    const [row, position] = coordinates;
    const groundType = this.map[row][position].asset;
    if (groundType === ImageAsset.Sand) {
      this.friend.move(coordinates);
      this.playSound(AudioAsset.SandStep);
    } else if (
      groundType === ImageAsset.Water &&
      this.movableImages.boat.isAt(coordinates)
    ) {
      this.friend.setOffsetY(this.movableImages.boat.offsetY * -1);
      this.friend.move(coordinates);
      this.playSound(AudioAsset.BoardBoat);
    } else {
      this.invalidMoves$.next();
    }
  }

  private isInWater() {
    return this.friend.isAt(this.movableImages.boat.coordinates());
  }

  private completeLevel() {
    this.levelCompleted = true;
    this.immovableSprites.castle.phaserObject.anims.play(CastleAnimation.Open);
    this.time.addEvent({
      delay: 500,
      callback: () =>
        this.friend.move(this.immovableSprites.castle.coordinates()),
      loop: false,
    });
    this.time.addEvent({
      delay: 1_000,
      callback: () => this.friend.disappear(),
      loop: false,
    });
    this.time.addEvent({
      delay: 1_500,
      callback: () => this.playSound(AudioAsset.Tada),
      loop: false,
    });
    this.time.addEvent({
      delay: 3_000,
      callback: () => this.scene.start(Level.Level2),
      loop: false,
    });
  }
}
