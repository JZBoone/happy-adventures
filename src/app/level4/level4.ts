import { Level } from "../types/level";
import { showLevelStartText } from "../common/helpers";
import { MiniPlaneAnimation } from "../types/sprite";
import { Coordinates, Move } from "../types/map";
import { AudioAsset } from "../types/audio";
import { Level4MapAndAssets } from "./level4-assets";

export class Level4 extends Level4MapAndAssets {
  constructor() {
    super({ key: Level.Level4 });
  }

  private motorSound!:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;
  private completedLevel = false;

  private isUnmounting = false;

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
  }

  private async handleMove(coordinates: Coordinates, move: Move) {
    if (
      !this.friend.mount &&
      this.spikies.some((spiky) => spiky.isAt(coordinates))
    ) {
      this.invalidMoves$.next();
      return;
    }

    if (
      !this.friend.mount &&
      this.movableSprites.miniPlane.occupies(coordinates)
    ) {
      this.friend.mountSprite(
        this.movableSprites.miniPlane,
        this.movableSprites.miniPlane.coordinates()
      );
      this.movableSprites.miniPlane.phaserObject.anims.play(
        MiniPlaneAnimation.Fly
      );
      this.motorSound.play();
      this.immovableImageGroups.trees.forEach((tree) => {
        tree.phaserObject.setDepth(0);
      });
      this.movableSprites.miniPlane.phaserObject.setDepth(10);
      return;
    }
    if (
      this.friend.mount &&
      this.immovableImages.landingPad.isAt(coordinates) &&
      !this.isUnmounting
    ) {
      this.isUnmounting = true;
      this.movableSprites.miniPlane.phaserObject.anims.stop();
      this.movableSprites.miniPlane.phaserObject.setFrame(0);
      await this.movableSprites.miniPlane.move(coordinates);
      this.friend.unmountSprite();
      const [start, end] = this.unmountCoordinates(move);
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
      !this.friend.mount &&
      this.immovableImages.magicTree.occupies(coordinates)
    ) {
      this.completedLevel = true;
      this.playSound(AudioAsset.Tada);
      this.scene.start(Level.Credits);
    }
    if (!this.isUnmounting) {
      this.friend.move(coordinates);
    }
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
}
