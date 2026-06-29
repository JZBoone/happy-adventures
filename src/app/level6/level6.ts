import { Scene } from "../types/scene";
import { newPromiseLasting, showLevelStartText } from "../common/helpers";
import { Coordinates } from "../types/map";
import { GroundType, Level6MapAndAssets } from "./level6-assets";
import { AudioAsset } from "../types/audio";
import { ImageAsset } from "../types/image";
import { mapTileSizePx } from "../common/map";
import { takeUntil, takeWhile } from "rxjs";

export class Level6 extends Level6MapAndAssets {
  didWin = false;
  finishedCreate = false;
  private cameraTween?: Phaser.Tweens.Tween;

  constructor() {
    super({ key: Scene.Level6 });
  }

  async create() {
    this.finishedCreate = false;
    await super.create();
    this.didWin = false;
    this.createFriend({ coordinates: [8, 7], dontFollow: true });
    this.moves$
      .pipe(
        takeWhile(() => !this.didWin),
        takeUntil(this.shutdown$)
      )
      .subscribe(({ coordinates, groundType }) =>
        this.handleMove(coordinates, groundType)
      );
    showLevelStartText(this, 6);
    this.finishedCreate = true;
    newPromiseLasting(this, 4_000, () => {
      this.initCameraMovement();
    });
  }

  private async handleMove(coordinates: Coordinates, groundType: GroundType) {
    if (groundType === ImageAsset.RainbowGlitter && !this.didWin) {
      this.didWin = true;
      this.playSound(AudioAsset.Tada);
      await this.friend.move(coordinates);
      newPromiseLasting(this, 1_500, () => this.scene.start(Scene.Level7));
      return;
    }
    if (groundType === ImageAsset.BlackHole) {
      this.movesDisabled = true;
      this.playSound(AudioAsset.Fall, { volume: 0.3 });
      this.friend.move(coordinates);
      await this.friend.disappear();
      this.restart();
    }
    this.friend.move(coordinates);
  }

  update() {
    if (this.movesDisabled || !this.finishedCreate) {
      return;
    }
    super.update();
    if (this.cameras.main.scrollX > this.friend.phaserObject.x - 25) {
      this.movesDisabled = true;
      this.playSound(AudioAsset.FunnyCry);
      newPromiseLasting(this, 2_000, () => {
        this.restart();
      });
      return;
    }
    this.cameras.main.scrollY = this.getCameraScrollY();
  }

  private initCameraMovement() {
    const camera = this.cameras.main;

    const distance = this.map[0].length * mapTileSizePx; // The horizontal distance the camera should move
    const duration = this.map[0].length * 700;

    this.cameraTween = this.tweens.add({
      targets: camera,
      scrollX: camera.scrollX + distance,
      ease: "Linear", // 'Linear' for constant speed
      duration: duration,
      repeat: 0, // No repeat, set to -1 for infinite repeat
      yoyo: false, // Set to true if you want the camera to move back to the starting position
    });
  }

  getCameraScrollY(): number {
    const unboundedScrollY =
      this.friend.phaserObject.y - this.cameras.main.height / 2;
    if (unboundedScrollY < 0) {
      return 0;
    }
    const maxScrollY =
      this.map.length * mapTileSizePx - this.cameras.main.height;
    if (unboundedScrollY > maxScrollY) {
      return maxScrollY;
    }
    return unboundedScrollY;
  }

  shutdown() {
    this.shutdown$.next();
    this.cameraTween?.destroy();
  }

  private async restart() {
    this.shutdown();
    this.scene.restart();
  }
}
