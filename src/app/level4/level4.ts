import Phaser from "phaser";
import { map } from "./map";
import { ImageAsset } from "../common/image";
import { Level } from "../common/level";
import { showLevelStartText } from "../common/helpers";
import { withAssets } from "../mixins/with-assets";
import { withMap } from "../mixins/with-map";
import { moveCoordinates } from "../common/map";
import { Movable } from "../common/movable";

export class Level4 extends withMap(
  withAssets(Phaser.Scene, {
    images: [ImageAsset.Friend, ImageAsset.Forest, ImageAsset.Tree],
  }),
  map
) {
  private friend!: Movable<Phaser.GameObjects.Image>;

  constructor() {
    super({ key: Level.Level4 });
  }

  create() {
    super.create();
    this.friend = this.createMovable({
      row: 0,
      position: 0,
      asset: ImageAsset.Friend,
    });
    this.createImage(50, 50, ImageAsset.Tree);
    this.createImage(100, 100, ImageAsset.Tree);
    showLevelStartText(this, 4);
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
    this.friend.move(newRow, newPosition);
  }
}
