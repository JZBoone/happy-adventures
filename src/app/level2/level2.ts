import Phaser from "phaser";
import { groundTypes, map } from "./map";
import { Level } from "../common/level";
import { showLevelStartText } from "../common/helpers";
import { Level2Data } from "./data";
import { withAssets } from "../mixins/with-assets";
import { withMap } from "../mixins/with-map";
import { Immovable } from "../common/immovable";
import { ImageAsset } from "../types/image";
import { AudioAsset } from "../types/audio";
import { Coordinates } from "../types/maps";

export class Level2 extends withMap(
  withAssets(Phaser.Scene, {
    images: [...groundTypes, ImageAsset.Monster, ImageAsset.Portal] as const,
    audio: [AudioAsset.Chomp, AudioAsset.Fall, AudioAsset.Stomp] as const,
  }),
  map
) {
  private monsterIsDead = false;
  private monster!: Immovable<Phaser.GameObjects.Image>;
  private portal!: Immovable<Phaser.GameObjects.Image>;

  constructor() {
    super({ key: Level.Level2 });
  }

  init(data: Level2Data) {
    if (data.monsterIsDead) {
      this.monsterIsDead = true;
    }
  }

  create() {
    super.create();
    if (!this.monsterIsDead) {
      this.monster = this.createImmovableImage({
        coordinates: [11, 13],
        asset: ImageAsset.Monster,
        height: 2,
        width: 2,
      });
    }
    this.portal = this.createImmovableImage({
      coordinates: [11, 15],
      asset: ImageAsset.Portal,
      height: 2,
      width: 2,
    });
    showLevelStartText(this, 2);
    const startingCoordinates: Coordinates = this.monsterIsDead
      ? [11, 13]
      : [0, 0];
    this.createFriend({ coordinates: startingCoordinates });
    this.moves$.subscribe(({ coordinates }) => this.handleMove(coordinates));
  }

  private handleMove(coordinates: Coordinates) {
    if (this.monsterIsDead && this.portal.occupies(coordinates)) {
      this.completeLevel(coordinates);
      return;
    }
    if (!this.monsterIsDead && this.monster.occupies(coordinates)) {
      this.swallowFriend(coordinates);
      return;
    }
    const [row, position] = coordinates;
    switch (map[row][position]) {
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
