import Phaser from "phaser";
import { range } from "lodash";
import { map } from "./map";
import { Level } from "../types/level";
import { showLevelStartText } from "../common/helpers";
import { withAssets } from "../mixins/with-assets";
import { withMap } from "../mixins/with-map";
import { Immovable } from "../common/immovable";
import { debounceTime } from "rxjs";
import { ImageAsset } from "../types/image";
import { MiniPlaneAnimation, SpriteAsset } from "../types/sprite";
import { Coordinates, Move } from "../types/maps";
import { Movable } from "../common/movable";
import { AudioAsset } from "../types/audio";

export class Level4 extends withMap(
  withAssets(Phaser.Scene, {
    images: [
      ImageAsset.Forest,
      ImageAsset.LandingPad,
      ImageAsset.Tree,
      ImageAsset.MagicTree,
      ImageAsset.Cactus,
      ImageAsset.BoobyTrap,
      ImageAsset.ThreeSpikes,
      ImageAsset.MountainSpikes,
      ImageAsset.SpikeBench,
      ImageAsset.SquareSpike,
    ] as const,
    audio: [AudioAsset.Motor] as const,
  }),
  map
) {
  constructor() {
    super({ key: Level.Level4 });
  }

  private spikies: Immovable<Phaser.GameObjects.Image>[] = [];
  private miniplane!: Movable<Phaser.GameObjects.Sprite>;
  private landingPad!: Immovable<Phaser.GameObjects.Image>;
  private trees: Immovable<Phaser.GameObjects.Image>[] = [];
  private motorSound!:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;
  private completedLevel = false;
  private magicTree!: Immovable<Phaser.GameObjects.Image>;

  create() {
    super.create();
    this.completedLevel = false;
    const spikyTypes = [
      ImageAsset.Cactus,
      ImageAsset.BoobyTrap,
      ImageAsset.ThreeSpikes,
      ImageAsset.MountainSpikes,
      ImageAsset.SpikeBench,
      ImageAsset.SquareSpike,
    ] as const;
    let spikyCounter = 0;
    for (const row of range(8, 18)) {
      for (const position of range(11, 21)) {
        if (range(9, 17).includes(row) && range(12, 20).includes(position)) {
          continue;
        }
        const asset = spikyTypes[spikyCounter % (spikyTypes.length - 1)];
        this.spikies.push(
          this.createImmovableImage({
            coordinates: [row, position],
            asset,
          })
        );
        spikyCounter++;
      }
    }
    this.landingPad = this.createImmovableImage({
      coordinates: [15, 14],
      height: 2,
      width: 2,
      asset: ImageAsset.LandingPad,
    });
    this.miniplane = this.createMovableSprite({
      coordinates: [29, 29],
      height: 2,
      width: 2,
      asset: SpriteAsset.MiniPlane,
    });
    const treeClumps: [startRow: number, startPosition: number][] = [
      [2, 1],
      [12, 4],
      [17, 25],
      [22, 10],
      [28, 28],
    ];
    for (const treeClump of treeClumps) {
      for (const row of [treeClump[0], treeClump[0] + 1]) {
        for (const position of [treeClump[1], treeClump[1] + 1]) {
          this.trees.push(
            this.createImmovableImage({
              coordinates: [row, position],
              asset: ImageAsset.Tree,
            })
          );
        }
      }
    }

    this.magicTree = this.createImmovableImage({
      coordinates: [12, 18],
      height: 2,
      width: 2,
      asset: ImageAsset.MagicTree,
    });
    this.createFriend();
    this.moves$
      .pipe(debounceTime(10))
      .subscribe(({ coordinates, move }) => this.handleMove(coordinates, move));
    showLevelStartText(this, 4);
    this.motorSound = this.addSound(AudioAsset.Motor, { loop: true });
  }

  private async handleMove(coordinates: Coordinates, move: Move) {
    if (
      !this.friend.mount &&
      this.spikies.some((spiky) => spiky.isAt(coordinates))
    ) {
      this.invalidMoves$.next();
      return;
    }

    if (!this.friend.mount && this.miniplane.occupies(coordinates)) {
      this.friend.mountSprite(this.miniplane, this.miniplane.coordinates());
      this.miniplane.phaserObject.anims.play(MiniPlaneAnimation.Fly);
      this.motorSound.play();
      this.trees.forEach((tree) => {
        tree.phaserObject.setDepth(0);
      });
      this.miniplane.phaserObject.setDepth(10);
      return;
    }
    if (this.friend.mount && this.landingPad.isAt(coordinates)) {
      this.miniplane.phaserObject.anims.stop();
      this.miniplane.phaserObject.setFrame(0);
      await this.miniplane.move(coordinates);
      this.friend.unmountSprite();
      const [start, end] = this.unmountCoordinates(move);
      await this.friend.move(start, {
        noAnimation: true,
      });
      await this.friend.move(end);
      this.motorSound.stop();
      return;
    }
    if (
      !this.completedLevel &&
      !this.friend.mount &&
      this.magicTree.occupies(coordinates)
    ) {
      this.completedLevel = true;
      this.playSound(AudioAsset.Tada);
    }
    this.friend.move(coordinates);
  }

  private unmountCoordinates(
    move: Move
  ): [start: Coordinates, end: Coordinates] {
    const [landingPadRow, landingPadPosition] = this.landingPad.coordinates();
    switch (move) {
      case "up":
        return [
          [landingPadRow - 1, landingPadPosition],
          [landingPadRow - 2, landingPadPosition],
        ];
      case "down":
        return [
          [landingPadRow, landingPadPosition],
          [landingPadRow + 1, landingPadPosition],
        ];
      case "left":
        return [
          [landingPadRow, landingPadPosition - 1],
          [landingPadRow, landingPadPosition - 2],
        ];
      case "right":
        return [
          [landingPadRow, landingPadPosition],
          [landingPadRow, landingPadPosition + 1],
        ];
    }
  }
}
