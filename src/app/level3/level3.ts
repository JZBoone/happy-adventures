import { Scene } from "../types/scene";
import { showLevelStartText, newPromiseLasting } from "../common/helpers";
import { Level2InitData } from "../level2/level2-init-data";
import { AudioAsset } from "../types/audio";
import { Coordinates } from "../types/map";
import { takeWhile } from "rxjs";
import { GroundType, Level3MapAndAssets } from "./level3-assets";
import { ImageAsset } from "../types/image";

export class Level3 extends Level3MapAndAssets {
  private levelCompleted = false;
  private isMelting = false;

  private readonly bomboffsetY = 25;
  private readonly hoistedBomboffsetY = 30;

  constructor() {
    super({ key: Scene.Level3 });
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
      .subscribe(({ coordinates, groundType }) =>
        this.handleMove(coordinates, groundType)
      );
    showLevelStartText(this, 3);
  }

  private async handleMove(coordinates: Coordinates, groundType: GroundType) {
    if (this.isMelting) {
      return;
    }
    if (groundType === ImageAsset.PurpleAcid) {
      this.isMelting = true;
      await this.friend.move(coordinates);
      this.playSound(AudioAsset.Sizzle);
      await this.friend.disappear();
      this.startOver();
      return;
    }
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

  private async explodeHeartAndCompleteLevel() {
    this.levelCompleted = true;
    this.playSound(AudioAsset.Explosion, { volume: 0.5 });
    this.immovableImages.heart.phaserObject.setVisible(false);
    this.movableImages.bomb.phaserObject.setVisible(false);
    await this.friend.disappear();
    this.playSound(AudioAsset.Tada);
    const data: Level2InitData = { monsterIsDead: true };
    await newPromiseLasting(this, 1_500, () =>
      this.scene.start(Scene.Level2, data)
    );
  }

  private startOver() {
    this.movableImages.bomb.setOffsetY(this.bomboffsetY);
    this.friend.move([0, 0], { noAnimation: true });
    this.friend.phaserObject.setVisible(true);
    this.isMelting = false;
  }
}
