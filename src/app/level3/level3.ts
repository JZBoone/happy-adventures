import Phaser from "phaser";
import { GroundType, boneCoordinates, heartCoordinates, map } from "./map";
import { AudioAsset } from "../audio";
import { ImageAsset } from "../image";
import { Level } from "../level";
import {
  disappearFriend,
  mapCoordinates,
  moveCoordinates,
  showLevelStartText,
  worldPosition,
} from "../helpers";
import { Level2Data } from "../level2/data";
import { withAssets } from "../mixins/with-assets";
import { withMap } from "../mixins/with-map";

export class Level3 extends withMap(
  withAssets(Phaser.Scene, {
    images: [
      ImageAsset.Goo,
      ImageAsset.Heart,
      ImageAsset.Lungs,
      ImageAsset.Bones,
      ImageAsset.Elasmosaurus,
      ImageAsset.SmallElasmosaurus,
      ImageAsset.Friend,
      ImageAsset.Bomb,
    ],
    audio: [
      AudioAsset.Grunt,
      AudioAsset.Explosion,
      AudioAsset.Tada,
      AudioAsset.Crunch,
      AudioAsset.Splat,
    ],
  }),
  map
) {
  private friend!: Phaser.GameObjects.Image;
  private bomb!: Phaser.GameObjects.Image;
  private heart!: Phaser.GameObjects.Image;

  private readonly bombYOffset = 25;
  private readonly hoistedBombYOffset = 30;
  private readonly BOMB_HOIST_COORDINATES: [row: number, position: number] = [
    11, 1,
  ];

  constructor() {
    super({ key: Level.Level3 });
  }

  create() {
    super.create();
    this.heart = this.createImage(600, 100, ImageAsset.Heart);
    this.createImage(250, 130, ImageAsset.Lungs);
    this.createImage(150, 430, ImageAsset.Bones);
    this.createImage(570, 330, ImageAsset.Bones);
    this.createImage(500, 430, ImageAsset.Elasmosaurus);
    this.createImage(500, 570, ImageAsset.SmallElasmosaurus);
    this.friend = this.createImage(
      ...worldPosition({ row: 0, position: 0 }),
      ImageAsset.Friend
    );
    this.bomb = this.createImage(
      ...worldPosition({
        row: 11,
        position: 1,
        yOffset: this.bombYOffset * -1,
      }),
      ImageAsset.Bomb
    );
    showLevelStartText(this, 3);
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
      this.isCarryingBomb() &&
      this.intersects(row, position, heartCoordinates)
    ) {
      this.explodeHeartAndCompleteLevel();
    } else if (
      row === this.BOMB_HOIST_COORDINATES[0] &&
      position === this.BOMB_HOIST_COORDINATES[1] &&
      !this.isCarryingBomb()
    ) {
      this.hoistBomb();
    }
    this.playAudio(
      this.intersects(row, position, boneCoordinates)
        ? AudioAsset.Crunch
        : AudioAsset.Splat
    );
    const [x, y] = worldPosition({ row, position });
    if (this.isCarryingBomb()) {
      this.friend.x = x;
      this.friend.y = y;
      this.bomb.y = this.friend.y - this.hoistedBombYOffset - this.bombYOffset;
      this.bomb.x = this.friend.x;
    } else {
      this.friend.x = x;
      this.friend.y = y;
    }
  }

  private intersects(
    row: number,
    position: number,
    coordinates: [row: number, position: number][]
  ): boolean {
    return coordinates.some((c) => c[0] === row && c[1] === position);
  }

  private isCarryingBomb() {
    return (
      this.bomb.y === this.friend.y - this.bombYOffset - this.hoistedBombYOffset
    );
  }

  private hoistBomb() {
    this.playAudio(AudioAsset.Grunt);
    this.bomb.y = this.bomb.y - this.hoistedBombYOffset;
  }

  private explodeHeartAndCompleteLevel() {
    this.playAudio(AudioAsset.Explosion);
    this.heart.setVisible(false);
    this.bomb.setVisible(false);
    disappearFriend(this, this.friend);
    this.time.addEvent({
      delay: 2_000,
      callback: () => this.playAudio(AudioAsset.Tada),
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
