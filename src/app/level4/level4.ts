import Phaser from "phaser";
import { map } from "./map";
import { ImageAsset } from "../image";
import { Level } from "../level";
import {
  mapCoordinates,
  moveCoordinates,
  showLevelStartText,
  worldPosition,
} from "../helpers";
import { withAssets } from "../mixins/with-assets";
import { withMap } from "../mixins/with-map";

export class Level4 extends withMap(
  withAssets(Phaser.Scene, {
    images: [ImageAsset.Friend, ImageAsset.Forest, ImageAsset.Tree],
  }),
  map
) {
  private friend!: Phaser.GameObjects.Image;

  constructor() {
    super({ key: Level.Level4 });
  }

  create() {
    super.create();
    this.friend = this.createImage(
      ...worldPosition({ row: 0, position: 0 }),
      ImageAsset.Friend
    );
    this.createImage(50, 50, ImageAsset.Tree);
    this.createImage(100, 100, ImageAsset.Tree);
    showLevelStartText(this, 4);
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
    const [x, y] = worldPosition({ row, position });
    this.friend.x = x;
    this.friend.y = y;
  }
}
