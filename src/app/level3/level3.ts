import Phaser from "phaser";
import { map } from "./map";
import { Level } from "../types/level";
import { showLevelStartText } from "../common/helpers";
import { Level2Data } from "../level2/data";
import { withAssets } from "../mixins/with-assets";
import { withMap } from "../mixins/with-map";
import { Movable } from "../common/movable";
import { Immovable } from "../common/immovable";
import { ImageAsset } from "../types/image";
import { AudioAsset } from "../types/audio";
import { Coordinates } from "../types/map";

export class Level3MapAndAssets extends withMap(
  withAssets(Phaser.Scene, {
    images: [
      ImageAsset.Goo,
      ImageAsset.Heart,
      ImageAsset.Lungs,
      ImageAsset.Bones,
      ImageAsset.Elasmosaurus,
      ImageAsset.SmallElasmosaurus,
      ImageAsset.Bomb,
    ] as const,
    audio: [
      AudioAsset.Grunt,
      AudioAsset.Explosion,
      AudioAsset.Crunch,
      AudioAsset.Splat,
    ] as const,
  }),
  map
) {}

export class Level3 extends Level3MapAndAssets {
  private bomb!: Movable<Phaser.GameObjects.Image>;
  private bones: Immovable<Phaser.GameObjects.Image>[] = [];
  private heart!: Immovable<Phaser.GameObjects.Image>;

  private readonly bomboffsetY = 25;
  private readonly hoistedBomboffsetY = 30;

  constructor() {
    super({ key: Level.Level3 });
  }

  async create() {
    await super.create();
    this.bones.push(
      this.createImmovableImage({
        coordinates: [9, 3],
        asset: ImageAsset.Bones,
        width: 2,
        height: 2,
      })
    );
    this.bones.push(
      this.createImmovableImage({
        coordinates: [7, 11],
        asset: ImageAsset.Bones,
        width: 2,
        height: 2,
      })
    );
    this.bones.push(
      this.createImmovableImage({
        coordinates: [10, 13],
        asset: ImageAsset.Elasmosaurus,
        width: 8,
        height: 4,
      })
    );
    this.bones.push(
      this.createImmovableImage({
        coordinates: [11, 11],
        asset: ImageAsset.SmallElasmosaurus,
        width: 4,
        height: 2,
      })
    );
    this.heart = this.createImmovableImage({
      coordinates: [3, 12],
      width: 3,
      height: 4,
      asset: ImageAsset.Heart,
    });
    this.tweens.add({
      targets: this.heart.phaserObject,
      scaleX: 1.25,
      scaleY: 1.25,
      ease: "Sine.easeInOut",
      duration: 600,
      yoyo: true,
      repeat: -1,
    });
    this.createImmovableImage({
      coordinates: [4, 7],
      asset: ImageAsset.Lungs,
      width: 6,
      height: 5,
    });
    this.createFriend();
    this.bomb = this.createMovableImage({
      coordinates: [11, 1],
      asset: ImageAsset.Bomb,
      offsetY: this.bomboffsetY,
    });
    this.moves$.subscribe(({ coordinates }) => this.handleMove(coordinates));
    showLevelStartText(this, 3);
  }

  private handleMove(coordinates: Coordinates) {
    if (this.isCarryingBomb() && this.heart.occupies(coordinates)) {
      this.explodeHeartAndCompleteLevel();
    } else if (this.bomb.isAt(coordinates) && !this.isCarryingBomb()) {
      this.hoistBomb();
    }
    if (this.bones.some((bones) => bones.occupies(coordinates))) {
      this.playSound(AudioAsset.Crunch, { volume: 0.5 });
    } else {
      this.playSound(AudioAsset.Splat, { volume: 0.25 });
    }

    if (this.isCarryingBomb()) {
      this.friend.move(coordinates);
      this.bomb.move(coordinates);
    } else {
      this.friend.move(coordinates);
    }
  }

  private isCarryingBomb() {
    return this.friend.isAt(this.bomb.coordinates());
  }

  private hoistBomb() {
    this.playSound(AudioAsset.Grunt, { volume: 0.5 });
    this.bomb.setOffsetY(this.hoistedBomboffsetY + this.bomboffsetY);
  }

  private explodeHeartAndCompleteLevel() {
    this.playSound(AudioAsset.Explosion, { volume: 0.5 });
    this.heart.phaserObject.setVisible(false);
    this.bomb.phaserObject.setVisible(false);
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
