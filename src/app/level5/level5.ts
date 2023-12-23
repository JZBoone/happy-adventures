import { Level } from "../types/level";
import { showLevelStartText } from "../common/helpers";
import { Coordinates } from "../types/map";
import { GroundType, Level5MapAndAssets } from "./level5-assets";
import { AudioAsset } from "../types/audio";
import { ImageAsset } from "../types/image";

export class Level5 extends Level5MapAndAssets {
  private isFalling = false;
  constructor() {
    super({ key: Level.Level5 });
  }

  async create() {
    await super.create();
    this.createFriend();
    this.moves$.subscribe(({ coordinates, groundType }) =>
      this.handleMove(coordinates, groundType)
    );
    showLevelStartText(this, 5);
  }

  private async handleMove(coordinates: Coordinates, groundType: GroundType) {
    if (this.isFalling) {
      return;
    }
    switch (groundType) {
      case ImageAsset.CrackedRainbowGlitter:
        this.isFalling = true;
        this.friend.move(coordinates);
        this.playSound(AudioAsset.RockDestroy);
        await this.friend.disappear();
        this.startOver();
        return;
      case ImageAsset.RainbowGlitter:
        this.playSound(AudioAsset.Twinkle, { volume: 0.3 });
        this.friend.move(coordinates);
    }
  }

  private startOver() {
    this.friend.move([0, 0], { noAnimation: true });
    this.friend.phaserObject.setVisible(true);
    this.isFalling = false;
  }
}
