import Phaser from "phaser";
import { groundTypes, map } from "./map";
import { AudioAsset } from "../common/audio";
import { ImageAsset } from "../common/image";
import { Level } from "../common/level";
import { disappearFriend, showLevelStartText } from "../common/helpers";
import { Level2Data } from "./data";
import { withAssets } from "../mixins/with-assets";
import { withMap } from "../mixins/with-map";
import { mapCoordinates, moveCoordinates, worldPosition } from "../common/map";

export class Level2 extends withMap(
  withAssets(Phaser.Scene, {
    images: [
      ...groundTypes,
      ImageAsset.Monster,
      ImageAsset.Friend,
      ImageAsset.Portal,
    ],
    audio: [
      AudioAsset.Tada,
      AudioAsset.Chomp,
      AudioAsset.Fall,
      AudioAsset.Stomp,
      AudioAsset.Thump,
    ],
  }),
  map
) {
  friend!: Phaser.GameObjects.Image;
  monsterIsDead = false;
  private readonly MONSTER_COORDINATES: [row: number, position: number][] = [
    [10, 12],
    [10, 13],
    [11, 12],
    [11, 13],
  ];
  private readonly PORTAL_COORDINATES: [row: number, position: number][] = [
    [10, 14],
    [10, 15],
    [11, 14],
    [11, 15],
  ];
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
    this.friend = this.createImage(
      ...worldPosition({ row: 0, position: 0 }),
      ImageAsset.Friend
    );
    if (!this.monsterIsDead) {
      this.createImage(650, 540, ImageAsset.Monster);
    }
    this.createImage(750, 540, ImageAsset.Portal);
    showLevelStartText(this, 2);
  }

  update() {
    const move = this.getMove();
    if (!move) {
      return;
    }
    const [row, position] = mapCoordinates({
      x: this.friend.x,
      y: this.friend.y,
    });
    const [newRow, newPosition] = moveCoordinates(move, row, position);
    if (this.moveIsOutOfBounds(newRow, newPosition)) {
      this.handleInvalidMove();
      return;
    }
    this.handleMove(newRow, newPosition);
  }

  private handleMove(row: number, position: number) {
    if (
      this.monsterIsDead &&
      this.friendIntersects(row, position, this.PORTAL_COORDINATES)
    ) {
      this.completeLevel(row, position);
      return;
    }
    if (
      !this.monsterIsDead &&
      this.friendIntersects(row, position, this.MONSTER_COORDINATES)
    ) {
      this.swallowFriend(row, position);

      return;
    }
    switch (map[row][position]) {
      case ImageAsset.Stone:
        this.moveFriend(row, position);
        this.playAudio(AudioAsset.Stomp);
        break;
      case ImageAsset.BlackHole:
        this.moveFriend(row, position);
        this.playAudio(AudioAsset.Fall);
        disappearFriend(this, this.friend);
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
    this.moveFriend(row, position);
    disappearFriend(this, this.friend);
  }

  private swallowFriend(row: number, position: number) {
    this.moveFriend(row, position);
    this.playAudio(AudioAsset.Chomp);
    disappearFriend(this, this.friend);
    this.time.addEvent({
      delay: 2_000,
      callback: () => this.scene.start(Level.Level3),
      loop: false,
    });
  }

  private friendIntersects(
    row: number,
    position: number,
    coordinates: [row: number, position: number][]
  ) {
    return coordinates.some((c) => c[0] === row && c[1] === position);
  }

  private moveFriend(row: number, position: number) {
    const [x, y] = worldPosition({ row, position });
    this.friend.x = x;
    this.friend.y = y;
  }
}
