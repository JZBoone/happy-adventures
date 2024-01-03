import { takeWhile } from "rxjs";
import { Scene } from "../types/scene";
import { showLevelStartText, newPromiseLasting } from "../common/helpers";
import { AudioAsset } from "../types/audio";
import { ImageAsset } from "../types/image";
import { CastleAnimation } from "../types/sprite";
import { Coordinates } from "../types/map";
import { GroundType, Level1MapAndAssets } from "./level1-assets";

export class Level1 extends Level1MapAndAssets {
  private levelCompleted = false;

  constructor() {
    super({ key: Scene.Level1 });
  }

  async create() {
    await super.create();
    this.levelCompleted = false;

    showLevelStartText(this, 1);
    this.createFriend();
    this.moves$
      .pipe(takeWhile(() => !this.levelCompleted))
      .subscribe(({ coordinates, groundType }) =>
        this.handleMove(coordinates, groundType)
      );
  }

  handleMove(coordinates: Coordinates, groundType: GroundType): void {
    if (this.immovableSprites.castle.isAt(coordinates)) {
      this.completeLevel();
      return;
    }
    if (!this.isInWater()) {
      this.handleOutOfWaterMove(coordinates, groundType);
    } else {
      this.handleInWaterMove(coordinates, groundType);
    }
  }

  private handleInWaterMove(coordinates: Coordinates, groundType: GroundType) {
    if (groundType === ImageAsset.Water) {
      this.friend.move(coordinates);
      this.movableImages.boat.move(coordinates);
      this.playSound(AudioAsset.Splash, { volume: 0.25 });
    } else if (this.isSand(groundType)) {
      this.playSound(AudioAsset.BoardBoat);
      this.friend.setOffsetY(0);
      this.friend.move(coordinates);
    } else {
      this.invalidMoves$.next();
    }
  }

  private handleOutOfWaterMove(
    coordinates: Coordinates,
    groundType: GroundType
  ) {
    if (this.isSand(groundType)) {
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

  private async completeLevel() {
    this.levelCompleted = true;
    this.immovableSprites.castle.phaserObject.anims.play(CastleAnimation.Open);
    await this.friend.move(this.immovableSprites.castle.coordinates());
    await this.friend.disappear();
    this.playSound(AudioAsset.Tada);
    await newPromiseLasting(this, 500, () => this.scene.start(Scene.Level2));
  }

  private isSand(groundType: GroundType): boolean {
    return [
      ImageAsset.Sand,
      ImageAsset.SandDown,
      ImageAsset.SandUp,
      ImageAsset.SandLeft,
      ImageAsset.SandRight,
    ].includes(groundType);
  }
}
