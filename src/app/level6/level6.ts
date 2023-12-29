import { Scene } from "../types/scene";
import { newPromiseLasting, showLevelStartText } from "../common/helpers";
import { Coordinates } from "../types/map";
import { GroundType, Level6MapAndAssets } from "./level6-assets";
import { AudioAsset } from "../types/audio";
import { ImageAsset } from "../types/image";
import { mapTileSizePx } from "../common/map";

export class Level6 extends Level6MapAndAssets {
  isFalling = false;
  isDying = false;
  didWin = false;

  constructor() {
    super({ key: Scene.Level6 });
  }

  async create() {
    await super.create();
    this.isDying = false;
    this.isFalling = false;
    this.didWin = false;
    this.createFriend({ coordinates: [8, 7], dontFollow: true });
    this.moves$.subscribe(({ coordinates, groundType }) =>
      this.handleMove(coordinates, groundType)
    );
    showLevelStartText(this, 6);
    newPromiseLasting(this, 4_000, () => this.initCameraMovement());
  }

  private async handleMove(coordinates: Coordinates, groundType: GroundType) {
    if (this.isDying || this.isFalling) {
      return;
    }
    if (groundType === ImageAsset.RainbowGlitter && !this.didWin) {
      this.didWin = true;
      this.playSound(AudioAsset.Tada);
      await this.friend.move(coordinates);
      newPromiseLasting(this, 1_500, () => this.scene.start(Scene.Credits));
      return;
    }
    if (groundType === ImageAsset.BlackHole) {
      this.isFalling = true;
      this.playSound(AudioAsset.Fall, { volume: 0.3 });
      this.friend.move(coordinates);
      await this.friend.disappear();
      this.scene.start(Scene.Level6);
    }
    this.friend.move(coordinates);
  }

  update() {
    super.update();
    if (this.cameras.main.scrollX > this.friend.phaserObject.x - 25) {
      this.isDying = true;
      this.playSound(AudioAsset.FunnyCry);
      newPromiseLasting(this, 2_000, () => {
        this.scene.start(Scene.Level6);
      });
      return;
    }
    this.cameras.main.scrollY = this.getCameraScrollY();
  }

  private initCameraMovement() {
    const camera = this.cameras.main;

    const distance = this.map[0].length * mapTileSizePx; // The horizontal distance the camera should move
    const duration = this.map[0].length * 700;

    this.tweens.add({
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
}
