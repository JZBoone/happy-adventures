import Phaser from "phaser";
import { groundTypes, map } from "./map";
import { AudioAsset } from "../common/audio";
import { ImageAsset } from "../common/image";
import { Level } from "../common/level";
import { disappearFriend, showLevelStartText } from "../common/helpers";
import { Level2Data } from "./data";
import { withAssets } from "../mixins/with-assets";
import { withMap } from "../mixins/with-map";
import { NonMovable } from "../common/non-movable";

export class Level2 extends withMap(
  withAssets(Phaser.Scene, {
    images: [...groundTypes, ImageAsset.Monster, ImageAsset.Portal] as const,
    audio: [
      AudioAsset.Tada,
      AudioAsset.Chomp,
      AudioAsset.Fall,
      AudioAsset.Stomp,
    ] as const,
  }),
  map
) {
  private monsterIsDead = false;
  private monster!: NonMovable<Phaser.GameObjects.Image>;
  private portal!: NonMovable<Phaser.GameObjects.Image>;

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
      this.monster = this.createNonMovableImage({
        row: 11,
        position: 13,
        asset: ImageAsset.Monster,
        height: 2,
        width: 2,
      });
    }
    this.portal = this.createNonMovableImage({
      row: 11,
      position: 15,
      asset: ImageAsset.Portal,
      height: 2,
      width: 2,
    });
    showLevelStartText(this, 2);
    const startingCoordinates = this.monsterIsDead ? [11, 13] : [0, 0];
    this.createFriend(...startingCoordinates);
    this.moves$.subscribe(([row, position]) => this.handleMove(row, position));
  }

  private handleMove(row: number, position: number) {
    if (this.monsterIsDead && this.portal.isAt(row, position)) {
      this.completeLevel(row, position);
      return;
    }
    if (!this.monsterIsDead && this.monster.isAt(row, position)) {
      this.swallowFriend(row, position);
      return;
    }
    switch (map[row][position]) {
      case ImageAsset.Stone:
        this.friend.move(row, position);
        this.playAudio(AudioAsset.Stomp);
        break;
      case ImageAsset.BlackHole:
        this.friend.move(row, position);
        this.playAudio(AudioAsset.Fall);
        disappearFriend(this, this.friend.movable);
        this.time.addEvent({
          delay: 2_000,
          callback: () => this.scene.start(Level.Level1),
          loop: false,
        });
        break;
    }
  }

  private completeLevel(row: number, position: number) {
    this.playAudio(AudioAsset.Tada);
    this.time.addEvent({
      delay: 2_000,
      callback: () => this.scene.start(Level.Level4),
      loop: false,
    });
    this.friend.move(row, position);
    disappearFriend(this, this.friend.movable);
  }

  private swallowFriend(row: number, position: number) {
    this.friend.move(row, position);
    this.playAudio(AudioAsset.Chomp);
    disappearFriend(this, this.friend.movable);
    this.time.addEvent({
      delay: 2_000,
      callback: () => this.scene.start(Level.Level3),
      loop: false,
    });
  }
}
