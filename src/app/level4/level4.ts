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
    images: [
      ImageAsset.Friend,
      ImageAsset.Forest,
      ImageAsset.Tree,
      ImageAsset.MagicTree,
      ImageAsset.Cactus,
      ImageAsset.BoobyTrap,
      ImageAsset.ThreeSpikes,
      ImageAsset.MountainSpikes,
      ImageAsset.SpikeBench,
      ImageAsset.SquareSpike,
    ] as const,
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
    this.createImage(200, 300, ImageAsset.Cactus);
    this.createImage(200, 250, ImageAsset.BoobyTrap);
    this.createImage(300, 380, ImageAsset.ThreeSpikes);
    this.createImage(410, 300, ImageAsset.MountainSpikes);
    this.createImage(315, 220, ImageAsset.SpikeBench);
    this.createImage(385, 220, ImageAsset.SquareSpike);
    this.createImage(300, 300, ImageAsset.MagicTree);
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
