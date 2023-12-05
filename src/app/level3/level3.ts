import Phaser from "phaser";
import { boneCoordinates, heartCoordinates, map } from "./map";
import { AudioAsset } from "../common/audio";
import { ImageAsset } from "../common/image";
import { Level } from "../common/level";
import { disappearFriend, showLevelStartText } from "../common/helpers";
import { Level2Data } from "../level2/data";
import { withAssets } from "../mixins/with-assets";
import { withMap } from "../mixins/with-map";
import { moveCoordinates } from "../common/map";
import { Movable } from "../common/movable";

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
  private friend!: Movable<Phaser.GameObjects.Image>;
  private bomb!: Movable<Phaser.GameObjects.Image>;
  private heart!: Phaser.GameObjects.Image;

  private readonly bomboffsetY = 25;
  private readonly hoistedBomboffsetY = 30;
  private readonly BOMB_HOIST_COORDINATES: [row: number, position: number] = [
    11, 1,
  ];

  constructor() {
    super({ key: Level.Level3 });
  }

  create() {
    super.create();
    this.heart = this.createImage(600, 100, ImageAsset.Heart);
    this.tweens.add({
      targets: this.heart,
      scaleX: 1.25,
      scaleY: 1.25,
      ease: "Sine.easeInOut",
      duration: 600,
      yoyo: true,
      repeat: -1,
    });
    this.createImage(250, 130, ImageAsset.Lungs);
    this.createImage(150, 430, ImageAsset.Bones);
    this.createImage(570, 330, ImageAsset.Bones);
    this.createImage(500, 430, ImageAsset.Elasmosaurus);
    this.createImage(500, 570, ImageAsset.SmallElasmosaurus);
    this.friend = this.createMovable({
      row: 0,
      position: 0,
      asset: ImageAsset.Friend,
    });
    this.bomb = this.createMovable({
      row: 11,
      position: 1,
      asset: ImageAsset.Bomb,
      offsetY: this.bomboffsetY,
    });
    showLevelStartText(this, 3);
  }

  update() {
    const move = this.getMove();
    if (!move) {
      return;
    }
    const [newRow, newPosition] = moveCoordinates(
      move,
      ...this.friend.coordinates()
    );
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
    if (this.isCarryingBomb()) {
      this.friend.move(row, position);
      this.bomb.move(row, position);
    } else {
      this.friend.move(row, position);
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
    return this.friend.isAt(...this.bomb.coordinates());
  }

  private hoistBomb() {
    this.playAudio(AudioAsset.Grunt);
    this.bomb.setOffsetY(this.hoistedBomboffsetY + this.bomboffsetY);
  }

  private explodeHeartAndCompleteLevel() {
    this.playAudio(AudioAsset.Explosion);
    this.heart.setVisible(false);
    this.bomb.movable.setVisible(false);
    disappearFriend(this, this.friend.movable);
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
