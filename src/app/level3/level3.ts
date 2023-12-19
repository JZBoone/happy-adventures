import { Level } from "../types/level";
import { showLevelStartText } from "../common/helpers";
import { Level2Data } from "../level2/data";
import { AudioAsset } from "../types/audio";
import { Coordinates } from "../types/map";
import { takeWhile } from "rxjs";
import { Level3MapAndAssets } from "./level3-assets";

export class Level3 extends Level3MapAndAssets {
  private levelCompleted = false;

  private readonly bomboffsetY = 25;
  private readonly hoistedBomboffsetY = 30;

  constructor() {
    super({ key: Level.Level3 });
  }

  get bones() {
    return [
      ...this.immovableImageGroups.bones,
      this.immovableImages.elasmosaurus,
      this.immovableImages.smallElasmosaurus,
    ];
  }

  async create() {
    this.levelCompleted = false;
    await super.create();
    this.tweens.add({
      targets: this.immovableImages.heart.phaserObject,
      scaleX: 1.25,
      scaleY: 1.25,
      ease: "Sine.easeInOut",
      duration: 600,
      yoyo: true,
      repeat: -1,
    });
    this.createFriend();
    this.moves$
      .pipe(takeWhile(() => !this.levelCompleted))
      .subscribe(({ coordinates }) => this.handleMove(coordinates));
    showLevelStartText(this, 3);
  }

  private handleMove(coordinates: Coordinates) {
    if (
      this.isCarryingBomb() &&
      this.immovableImages.heart.occupies(coordinates)
    ) {
      this.explodeHeartAndCompleteLevel();
    } else if (
      this.movableImages.bomb.isAt(coordinates) &&
      !this.isCarryingBomb()
    ) {
      this.hoistBomb();
    }
    if (this.bones.some((bones) => bones.occupies(coordinates))) {
      this.playSound(AudioAsset.Crunch, { volume: 0.5 });
    } else {
      this.playSound(AudioAsset.Splat, { volume: 0.25 });
    }

    if (this.isCarryingBomb()) {
      this.friend.move(coordinates);
      this.movableImages.bomb.move(coordinates);
    } else {
      this.friend.move(coordinates);
    }
  }

  private isCarryingBomb() {
    return this.friend.isAt(this.movableImages.bomb.coordinates());
  }

  private hoistBomb() {
    this.playSound(AudioAsset.Grunt, { volume: 0.5 });
    this.movableImages.bomb.setOffsetY(
      this.hoistedBomboffsetY + this.bomboffsetY
    );
  }

  private explodeHeartAndCompleteLevel() {
    this.levelCompleted = true;
    this.playSound(AudioAsset.Explosion, { volume: 0.5 });
    this.immovableImages.heart.phaserObject.setVisible(false);
    this.movableImages.bomb.phaserObject.setVisible(false);
    this.friend.disappear();
    this.time.addEvent({
      delay: 2_000,
      callback: () => this.playSound(AudioAsset.Tada),
      loop: false,
    });
    const data: Level2Data = { monsterIsDead: true };
    this.time.addEvent({
      delay: 4_000,
      callback: () => this.scene.start(Level.Level2, data),
      loop: false,
    });
  }
}
