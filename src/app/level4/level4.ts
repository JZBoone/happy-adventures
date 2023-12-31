import { isEqual } from "lodash";
import { Scene } from "../types/scene";
import { showLevelStartText, newPromiseLasting } from "../common/helpers";
import { Coordinates, Move } from "../types/map";
import { AudioAsset } from "../types/audio";
import { Level4MapAndAssets } from "./level4-assets";

export class Level4 extends Level4MapAndAssets {
  constructor() {
    super({ key: Scene.Level4 });
  }

  private motorSound!:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;
  private completedLevel = false;
  private isGettingSpiked = false;

  private isMounting = false;
  private isUnmounting = false;
  private planeStartCoordinates!: Coordinates;

  private get spikies() {
    return [
      ...this.immovableImageGroups.cactus,
      ...this.immovableImageGroups.boobyTrap,
      ...this.immovableImageGroups.threeSpikes,
      ...this.immovableImageGroups.mountainSpikes,
      ...this.immovableImageGroups.spikeBench,
      ...this.immovableImageGroups.squareSpike,
    ];
  }

  async create() {
    await super.create();
    this.completedLevel = false;
    this.createFriend();
    this.moves$.subscribe(({ coordinates, move }) =>
      this.handleMove(coordinates, move)
    );
    showLevelStartText(this, 4);
    this.motorSound = this.addSound(AudioAsset.Motor, { loop: true });
    this.planeStartCoordinates = this.movableImages.magicalCraft.coordinates();
  }

  private async handleMove(coordinates: Coordinates, move: Move) {
    if (this.isGettingSpiked || this.isUnmounting || this.isMounting) {
      return;
    }
    if (
      !this.isOnCraft() &&
      this.spikies.some((spiky) => spiky.isAt(coordinates))
    ) {
      this.isGettingSpiked = true;
      this.playSound(AudioAsset.FunnyCry);
      await this.friend.move(coordinates);
      this.tweens.add({
        targets: this.friend.phaserObject,
        y: this.friend.phaserObject.y - 300,
        ease: Phaser.Math.Easing.Quadratic.Out,
        duration: 1_000,
        onComplete: () => {
          this.startOver();
        },
      });
      return;
    }

    if (!this.isOnCraft() && this.isInPositionToMountCraft(coordinates)) {
      this.mountMagicalCraft();
      return;
    }
    if (
      this.isOnCraft() &&
      this.immovableImages.landingPad.isAt([
        coordinates[0] + 1,
        coordinates[1],
      ]) &&
      !this.isUnmounting
    ) {
      this.isUnmounting = true;
      await Promise.all([
        this.movableImages.magicalCraft.move([
          coordinates[0] + 1,
          coordinates[1],
        ]),
        this.friend.move(coordinates),
      ]);
      const [start, end] = this.unmountCoordinates(move);
      this.friend.setOffsetX(0);
      await this.friend.move(start, {
        noAnimation: true,
      });
      await this.friend.move(end);
      this.motorSound.stop();
      this.isUnmounting = false;
      return;
    }
    if (
      !this.completedLevel &&
      !this.isOnCraft() &&
      this.immovableImages.magicTree.occupies(coordinates)
    ) {
      this.completedLevel = true;
      this.playSound(AudioAsset.Tada);
      await newPromiseLasting(this, 1_000, () =>
        this.scene.start(Scene.Level5)
      );
    }
    await Promise.all([
      this.friend.move(coordinates),
      this.isOnCraft()
        ? this.movableImages.magicalCraft.move([
            coordinates[0] + 1,
            coordinates[1],
          ])
        : Promise.resolve(),
    ]);
  }

  private unmountCoordinates(
    move: Move
  ): [start: Coordinates, end: Coordinates] {
    const [landingPadRow, landingPadPosition] =
      this.immovableImages.landingPad.coordinates();
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

  private async startOver() {
    this.movableImages.magicalCraft.move(this.planeStartCoordinates, {
      noAnimation: true,
    });
    await this.friend.move([0, 0], { noAnimation: true });
    this.friend.phaserObject.setVisible(true);
    this.isGettingSpiked = false;
  }

  private isInPositionToMountCraft(coordinates: Coordinates) {
    const [craftRow, craftPosition] =
      this.movableImages.magicalCraft.coordinates();
    return (
      isEqual([craftRow - 1, craftPosition], coordinates) ||
      isEqual([craftRow - 1, craftPosition - 1], coordinates) ||
      isEqual([craftRow, craftPosition], coordinates) ||
      isEqual([craftRow, craftPosition - 1], coordinates)
    );
  }

  private isOnCraft() {
    const craftCoordinates = this.movableImages.magicalCraft.coordinates();
    const [friendRow, friendPosition] = this.friend.coordinates();
    return isEqual(craftCoordinates, [friendRow + 1, friendPosition]);
  }

  private async mountMagicalCraft() {
    this.isMounting = true;
    const [craftRow, craftPosition] =
      this.movableImages.magicalCraft.coordinates();
    this.friend.setOffsetX(25);
    await this.friend.move([craftRow - 1, craftPosition]);
    this.motorSound.play();
    this.immovableImageGroups.trees.forEach((tree) => {
      tree.phaserObject.setDepth(0);
    });
    this.movableImages.magicalCraft.phaserObject.setDepth(10);
    this.isMounting = false;
  }
}
