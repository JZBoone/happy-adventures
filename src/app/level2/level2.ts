import Phaser from "phaser";
import { takeWhile } from "rxjs";
import { GroundType, groundTypes } from "./ground-type";
import { Level } from "../types/level";
import { showLevelStartText } from "../common/helpers";
import { Level2Data } from "./data";
import { withAssets } from "../mixins/with-assets";
import { withMap } from "../mixins/with-map";
import { ImageAsset } from "../types/image";
import { AudioAsset } from "../types/audio";
import { Coordinates } from "../types/map";

export class Level2MapAndAssets extends withMap(
  withAssets(Phaser.Scene, {
    images: [
      ...groundTypes,
      ImageAsset.Monster,
      ImageAsset.Portal,
      ImageAsset.Queen,
      ImageAsset.MonsterGuts,
    ] as const,
    audio: [
      AudioAsset.Chomp,
      AudioAsset.Fall,
      AudioAsset.Stomp,
      AudioAsset.Whoosh,
    ] as const,
  }),
  {
    level: Level.Level2,
    immovableImages: {
      monster: { asset: ImageAsset.Monster },
      portal: { asset: ImageAsset.Portal },
    } as const,
  }
) {}

export class Level2 extends Level2MapAndAssets {
  private monsterIsDead = false;
  private didFinishScene = false;
  private isFalling = false;

  constructor() {
    super({ key: Level.Level2 });
  }

  init(data: Level2Data) {
    if (data.monsterIsDead) {
      this.monsterIsDead = true;
    }
  }

  async create() {
    await super.create();
    this.didFinishScene = false;
    const monsterCoordinates = this.immovableImages.monster.coordinates();
    if (this.monsterIsDead) {
      this.immovableImages.monster.phaserObject.setVisible(false);
      this.createImage({
        coordinates: monsterCoordinates,
        width: 2,
        height: 2,
        asset: ImageAsset.MonsterGuts,
      });
    } else {
      showLevelStartText(this, 2);
    }
    const startingCoordinates: Coordinates = this.monsterIsDead
      ? [monsterCoordinates[0], monsterCoordinates[1] - 2]
      : [0, 0];
    this.createFriend({ coordinates: startingCoordinates });
    this.moves$
      .pipe(takeWhile(() => !this.didFinishScene))
      .subscribe(({ coordinates, groundType }) =>
        this.handleMove(coordinates, groundType as GroundType)
      );
  }

  private async handleMove(coordinates: Coordinates, groundType: GroundType) {
    if (this.isFalling) {
      return;
    }
    if (
      this.monsterIsDead &&
      this.immovableImages.portal.occupies(coordinates)
    ) {
      this.completeLevel(coordinates);
      return;
    }
    if (
      !this.monsterIsDead &&
      this.immovableImages.monster.occupies(coordinates)
    ) {
      this.swallowFriend(coordinates);
      return;
    }
    switch (groundType) {
      case ImageAsset.Stone:
        this.friend.move(coordinates);
        this.playSound(AudioAsset.Stomp, { volume: 0.5 });
        break;
      case ImageAsset.BlackHole:
        this.isFalling = true;
        this.friend.move(coordinates);
        this.playSound(AudioAsset.Fall);
        await this.friend.disappear();
        this.startOver();
        break;
    }
  }

  private completeLevel(coordinates: Coordinates) {
    this.didFinishScene = true;
    this.friend.disappear();
    this.playSound(AudioAsset.Whoosh);
    this.time.addEvent({
      delay: 6_000,
      callback: () => this.scene.start(Level.Level4),
      loop: false,
    });
    this.friend.move(coordinates);
    this.friend.disappear();
  }

  private swallowFriend(coordinates: Coordinates) {
    this.didFinishScene = true;
    this.friend.move(coordinates);
    this.playSound(AudioAsset.Chomp);
    this.friend.disappear();
    this.time.addEvent({
      delay: 2_000,
      callback: () => this.scene.start(Level.Level3),
      loop: false,
    });
  }

  private startOver() {
    this.friend.move([0, 0], { noAnimation: true });
    this.friend.phaserObject.setVisible(true);
    this.isFalling = false;
  }
}
