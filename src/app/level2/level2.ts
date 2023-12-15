import Phaser from "phaser";
import { takeWhile } from "rxjs";
import { groundTypes } from "./map";
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
    ] as const,
    audio: [AudioAsset.Chomp, AudioAsset.Fall, AudioAsset.Stomp] as const,
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
  private didShutDown = false;

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
    this.didShutDown = false;
    if (this.monsterIsDead) {
      this.immovableImages.monster.phaserObject.setVisible(false);
    }
    showLevelStartText(this, 2);
    const startingCoordinates: Coordinates = this.monsterIsDead
      ? [11, 13]
      : [0, 0];
    this.createFriend({ coordinates: startingCoordinates });
    this.moves$
      .pipe(takeWhile(() => !this.didShutDown))
      .subscribe(({ coordinates }) => this.handleMove(coordinates));
  }

  private handleMove(coordinates: Coordinates) {
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
    const [row, position] = coordinates;
    switch (this.map[row][position].asset) {
      case ImageAsset.Stone:
        this.friend.move(coordinates);
        this.playSound(AudioAsset.Stomp, { volume: 0.5 });
        break;
      case ImageAsset.BlackHole:
        this.friend.move(coordinates);
        this.playSound(AudioAsset.Fall);
        this.friend.disappear();
        this.time.addEvent({
          delay: 2_000,
          callback: () => this.scene.start(Level.Level1),
          loop: false,
        });
        break;
    }
  }

  private completeLevel(coordinates: Coordinates) {
    this.didShutDown = true;
    this.playSound(AudioAsset.Tada);
    this.time.addEvent({
      delay: 2_000,
      callback: () => this.scene.start(Level.Level4),
      loop: false,
    });
    this.friend.move(coordinates);
    this.friend.disappear();
  }

  private swallowFriend(coordinates: Coordinates) {
    this.didShutDown = true;
    this.friend.move(coordinates);
    this.playSound(AudioAsset.Chomp);
    this.friend.disappear();
    this.time.addEvent({
      delay: 2_000,
      callback: () => this.scene.start(Level.Level3),
      loop: false,
    });
  }
}
