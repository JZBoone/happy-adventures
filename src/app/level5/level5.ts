import { Scene } from "../types/scene";
import { showLevelStartText, newPromiseLasting } from "../common/helpers";
import { Coordinates } from "../types/map";
import { GroundType, Level5MapAndAssets } from "./level5-assets";
import { AudioAsset } from "../types/audio";
import { ImageAsset } from "../types/image";
import { CandyCastleAnimation } from "../types/sprite";
import { isEqual } from "lodash";

export class Level5 extends Level5MapAndAssets {
  private isFalling = false;
  private levelCompleted = false;
  constructor() {
    super({ key: Scene.Level5 });
  }

  async create() {
    await super.create();
    this.createFriend();
    this.moves$.subscribe(({ coordinates, groundType }) =>
      this.handleMove(coordinates, groundType)
    );
    showLevelStartText(this, 5);
  }

  private async handleMove(coordinates: Coordinates, groundType: GroundType) {
    const hackCoordinates: Coordinates = [8, 15];
    const hackTransportCoordinates: Coordinates = [47, 90];
    let isHacked = false;
    if (isEqual(hackCoordinates, coordinates)) {
      isHacked = true;
    }
    if (this.isFalling || this.levelCompleted) {
      return;
    }
    if (isEqual(this.castleDoorCoordinates(), coordinates)) {
      if (this.isCarryingMagicalLollipopKey()) {
        this.completeLevel();
      }
      return;
    }
    if (
      this.immovableImageGroups.lollipops.some((lollipop) =>
        lollipop.isAt(coordinates)
      ) ||
      this.immovableImageGroups.gumdrops.some((gumdrop) =>
        gumdrop.isAt(coordinates)
      ) ||
      this.immovableImageGroups.peppermints.some((peppermint) =>
        peppermint.isAt(coordinates)
      ) ||
      this.immovableSprites.candyCastle.occupies(coordinates)
    ) {
      this.invalidMoves$.next();
      return;
    }
    if (
      this.movableImages.magicLollipopKey.occupies(coordinates) &&
      !this.isCarryingMagicalLollipopKey()
    ) {
      await this.hoistMagicalLollipopKey();
    }
    if (groundType === ImageAsset.CrackedRainbowGlitter && !isHacked) {
      this.isFalling = true;
      await this.friend.move(coordinates);
      this.playSound(AudioAsset.RockDestroy);
      await this.friend.disappear();
      this.startOver();
      return;
    }
    if (groundType === ImageAsset.RainbowGlitter) {
      this.playSound(AudioAsset.Twinkle, { volume: 0.3 });
    }
    if (isHacked) {
      this.isFalling = true;
      const hasKey = this.isCarryingMagicalLollipopKey();
      await Promise.all([
        this.friend.move(coordinates),
        hasKey
          ? this.movableImages.magicLollipopKey.move(coordinates)
          : Promise.resolve(),
      ]);
      this.playSound(AudioAsset.Whoosh);
      await this.friend.disappear();
      this.friend.phaserObject.setVisible(true);
      await this.friend.move(hackTransportCoordinates);
      this.isFalling = false;
      if (hasKey) {
        this.movableImages.magicLollipopKey.move(hackTransportCoordinates);
      }
      return;
    }
    if (this.isCarryingMagicalLollipopKey()) {
      this.movableImages.magicLollipopKey.move(coordinates);
    }
    this.friend.move(isHacked ? hackTransportCoordinates : coordinates);
  }

  private startOver() {
    this.friend.move([0, 0], { noAnimation: true });
    this.friend.phaserObject.setVisible(true);
    this.isFalling = false;
  }

  private async completeLevel() {
    this.levelCompleted = true;
    this.immovableSprites.candyCastle.phaserObject.anims.play(
      CandyCastleAnimation.Open
    );
    this.friend.setOffsetY(5);
    await this.friend.move(this.castleDoorCoordinates());
    this.movableImages.magicLollipopKey.phaserObject.setVisible(false);
    this.playSound(AudioAsset.SparklingStar);
    await this.friend.disappear();
    this.playSound(AudioAsset.Tada);
    await newPromiseLasting(this, 500, () => this.scene.start(Scene.Level6));
  }

  private castleDoorCoordinates(): Coordinates {
    const [row, position] = this.immovableSprites.candyCastle.coordinates();
    return [row, position - 3];
  }

  private isCarryingMagicalLollipopKey() {
    return this.friend.isAt(this.movableImages.magicLollipopKey.coordinates());
  }

  private async hoistMagicalLollipopKey() {
    this.playSound(AudioAsset.SuccessBell);
    await this.movableImages.magicLollipopKey.move(this.friend.coordinates());
  }
}
