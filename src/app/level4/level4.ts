import Phaser from "phaser";
import { map } from "./map";
import { ImageAsset } from "../common/image";
import { Level } from "../common/level";
import { showLevelStartText } from "../common/helpers";
import { withAssets } from "../mixins/with-assets";
import { withMap } from "../mixins/with-map";

export class Level4 extends withMap(
  withAssets(Phaser.Scene, {
    images: [
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
  constructor() {
    super({ key: Level.Level4 });
  }

  create() {
    super.create();
    this.createNonMovable({ row: 2, position: 2, asset: ImageAsset.Tree });
    this.createNonMovable({
      row: 10,
      position: 9,
      asset: ImageAsset.Tree,
    });
    this.createNonMovable({
      row: 5,
      position: 5,
      asset: ImageAsset.Cactus,
    });
    this.createNonMovable({
      row: 7,
      position: 7,
      asset: ImageAsset.BoobyTrap,
    });
    this.createNonMovable({
      row: 4,
      position: 8,
      asset: ImageAsset.ThreeSpikes,
    });
    this.createNonMovable({
      row: 7,
      position: 9,
      asset: ImageAsset.MountainSpikes,
    });
    this.createNonMovable({
      row: 3,
      position: 8,
      asset: ImageAsset.SpikeBench,
    });
    this.createNonMovable({
      row: 5,
      position: 10,
      asset: ImageAsset.SquareSpike,
    });
    this.createNonMovable({
      row: 5,
      position: 8,
      height: 2,
      width: 2,
      asset: ImageAsset.MagicTree,
    });
    this.createFriend();
    this.moves$.subscribe(([row, position]) => this.handleMove(row, position));
    showLevelStartText(this, 4);
  }

  private handleMove(newRow: number, newPosition: number) {
    this.friend.move(newRow, newPosition);
  }
}
