import { takeWhile } from "rxjs";
import { Scene } from "../types/scene";
import { showLevelStartText, newPromiseLasting } from "../common/helpers";
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
    super({ key: Scene.Level2 });
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
      this.completeLevel();
      return;
    }
    if (
      !this.monsterIsDead &&
      this.immovableImages.monster.occupies(coordinates)
    ) {
      this.swallowFriend();
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

  private async completeLevel() {
    this.didFinishScene = true;
    // center friend in the portal
    this.friend.height = this.immovableImages.portal.height;
    this.friend.width = this.immovableImages.portal.width;
    this.friend.move(this.immovableImages.portal.coordinates());
    this.playSound(AudioAsset.Whoosh);
    await this.friend.disappear();
    await newPromiseLasting(this, 4_000, () => this.scene.start(Scene.Level4));
  }

  private async swallowFriend() {
    this.didFinishScene = true;
    // center friend in monster's mouth
    this.friend.height = this.immovableImages.monster.height;
    this.friend.width = this.immovableImages.monster.width;
    this.friend.setOffsetX(10);
    await this.friend.move(this.immovableImages.monster.coordinates());
    this.playSound(AudioAsset.Chomp);
    await this.friend.disappear();
    this.scene.start(Scene.Level3);
  }

  private startOver() {
    this.friend.move([0, 0], { noAnimation: true });
    this.friend.phaserObject.setVisible(true);
    this.isFalling = false;
  }
}
