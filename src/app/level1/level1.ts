import Phaser from "phaser";
import { takeWhile } from "rxjs";
import { map } from "./map";
import { Level } from "../types/level";
import { showLevelStartText } from "../common/helpers";
import { withAssets } from "../mixins/with-assets";
import { withMap } from "../mixins/with-map";
import { Movable } from "../common/movable";
import { Immovable } from "../common/immovable";
import { AudioAsset } from "../types/audio";
import { ImageAsset } from "../types/image";
import { CastleAnimation, SpriteAsset } from "../types/sprite";
import { Coordinates } from "../types/maps";

export class Level1 extends withMap(
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
  map
) {
  private castle!: Immovable<Phaser.GameObjects.Sprite>;
  private boat!: Movable<Phaser.GameObjects.Image>;
  private levelCompleted = false;

  constructor() {
    super({ key: Level.Level1 });
  }

  create() {
    super.create();
    this.levelCompleted = false;
    this.castle = this.createImmovableSprite({
      coordinates: [6, 4],
      offsetY: 45,
      asset: SpriteAsset.Castle,
    });
    this.boat = this.createMovableImage({
      coordinates: [10, 14],
      offsetY: -15,
      asset: ImageAsset.Boat,
    });

    showLevelStartText(this, 1);
    this.createFriend();
    this.moves$
      .pipe(takeWhile(() => !this.levelCompleted))
      .subscribe(({ coordinates }) => this.handleMove(coordinates));
  }

  handleMove(coordinates: Coordinates): void {
    if (this.castle.isAt(coordinates)) {
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
    const groundType = map[row][position];
    if (groundType === ImageAsset.Water) {
      this.friend.move(coordinates);
      this.boat.move(coordinates);
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
    const groundType = map[row][position];
    if (groundType === ImageAsset.Sand) {
      this.friend.move(coordinates);
      this.playSound(AudioAsset.SandStep);
    } else if (groundType === ImageAsset.Water && this.boat.isAt(coordinates)) {
      this.friend.setOffsetY(this.boat.offsetY * -1);
      this.friend.move(coordinates);
      this.playSound(AudioAsset.BoardBoat);
    } else {
      this.invalidMoves$.next();
    }
  }

  private isInWater() {
    return this.friend.isAt(this.boat.coordinates());
  }

  private completeLevel() {
    this.levelCompleted = true;
    this.castle.phaserObject.anims.play(CastleAnimation.Open);
    this.time.addEvent({
      delay: 500,
      callback: () => this.friend.move(this.castle.coordinates()),
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
