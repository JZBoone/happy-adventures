import Phaser from "phaser";
import { map } from "./map";
import { AudioAsset } from "../common/audio";
import { ImageAsset } from "../common/image";
import { Level } from "../common/level";
import { disappearFriend, showLevelStartText } from "../common/helpers";
import { Level2Data } from "../level2/data";
import { withAssets } from "../mixins/with-assets";
import { withMap } from "../mixins/with-map";
import { Movable } from "../common/movable";
import { NonMovable } from "../common/non-movable";

export class Level3 extends withMap(
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
      AudioAsset.Tada,
      AudioAsset.Crunch,
      AudioAsset.Splat,
    ] as const,
  }),
  map
) {
  private bomb!: Movable<Phaser.GameObjects.Image>;
  private bones: NonMovable<Phaser.GameObjects.Image>[] = [];
  private heart!: NonMovable<Phaser.GameObjects.Image>;

  private readonly bomboffsetY = 25;
  private readonly hoistedBomboffsetY = 30;

  constructor() {
    super({ key: Level.Level3 });
  }

  create() {
    super.create();
    this.bones.push(
      this.createNonMovableImage({
        row: 9,
        position: 3,
        asset: ImageAsset.Bones,
        width: 2,
        height: 2,
      })
    );
    this.bones.push(
      this.createNonMovableImage({
        row: 7,
        position: 11,
        asset: ImageAsset.Bones,
        width: 2,
        height: 2,
      })
    );
    this.bones.push(
      this.createNonMovableImage({
        row: 10,
        position: 13,
        asset: ImageAsset.Elasmosaurus,
        width: 8,
        height: 4,
      })
    );
    this.bones.push(
      this.createNonMovableImage({
        row: 11,
        position: 11,
        asset: ImageAsset.SmallElasmosaurus,
        width: 4,
        height: 2,
      })
    );
    this.createFriend();
    this.bomb = this.createMovable({
      row: 11,
      position: 1,
      asset: ImageAsset.Bomb,
      offsetY: this.bomboffsetY,
    });
    this.heart = this.createNonMovableImage({
      row: 3,
      position: 12,
      width: 3,
      height: 4,
      asset: ImageAsset.Heart,
    });
    this.tweens.add({
      targets: this.heart.nonMovable,
      scaleX: 1.25,
      scaleY: 1.25,
      ease: "Sine.easeInOut",
      duration: 600,
      yoyo: true,
      repeat: -1,
    });
    this.createNonMovableImage({
      row: 4,
      position: 7,
      asset: ImageAsset.Lungs,
      width: 6,
      height: 5,
    });
    this.moves$.subscribe(([row, position]) => this.handleMove(row, position));
    showLevelStartText(this, 3);
  }

  private handleMove(row: number, position: number) {
    if (this.isCarryingBomb() && this.heart.isAt(row, position)) {
      this.explodeHeartAndCompleteLevel();
    } else if (this.bomb.isAt(row, position) && !this.isCarryingBomb()) {
      this.hoistBomb();
    }
    this.playAudio(
      this.bones.some((bones) => bones.isAt(row, position))
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

  private isCarryingBomb() {
    return this.friend.isAt(...this.bomb.coordinates());
  }

  private hoistBomb() {
    this.playAudio(AudioAsset.Grunt);
    this.bomb.setOffsetY(this.hoistedBomboffsetY + this.bomboffsetY);
  }

  private explodeHeartAndCompleteLevel() {
    this.playAudio(AudioAsset.Explosion);
    this.heart.nonMovable.setVisible(false);
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
