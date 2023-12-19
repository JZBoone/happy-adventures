import { takeWhile } from "rxjs";
import { Level } from "../types/level";
import { showLevelStartText } from "../common/helpers";
import { Level2InitData } from "./level2-init-data";
import { ImageAsset } from "../types/image";
import { AudioAsset } from "../types/audio";
import { Coordinates } from "../types/map";
import { GroundType, Level2MapAndAssets } from "./level2-assets";

export class Level2 extends Level2MapAndAssets {
  private monsterIsDead = false;
  private didFinishScene = false;
  private isFalling = false;

  constructor() {
    super({ key: Level.Level2 });
  }

  init(data: Level2InitData) {
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
        this.handleMove(coordinates, groundType)
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
