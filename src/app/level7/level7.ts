import { Scene } from "../types/scene";
import { showLevelStartText, newPromiseLasting } from "../common/helpers";
import { Coordinates } from "../types/map";
import { GroundType, Level7MapAndAssets } from "./level7-assets";
import { AudioAsset } from "../types/audio";
import { ImageAsset } from "../types/image";
import { CandyCastleAnimation } from "../types/sprite";
import { isEqual } from "lodash";
import { takeWhile } from "rxjs";

export class Level7 extends Level7MapAndAssets {
  completedLevel = false;
  constructor() {
    super({ key: Scene.Level7 });
  }

  async create() {
    await super.create();
    this.createFriend();
    this.moves$
      .pipe(takeWhile(() => !this.completedLevel))
      .subscribe(({ coordinates, groundType }) =>
        this.handleMove(coordinates, groundType)
      );
    showLevelStartText(this, 7);
  }

  private async handleMove(coordinates: Coordinates, groundType: GroundType) {
    this.friend.move(coordinates);
  }

  private startOver() {
    this.friend.move([0, 0], { noAnimation: true });
    this.friend.phaserObject.setVisible(true);
    this.movesDisabled = false;
  }

  private async completeLevel() {
    this.completedLevel = true;
    await this.friend.disappear();
    this.playSound(AudioAsset.Tada);
    await newPromiseLasting(this, 500, () => this.scene.start(Scene.Credits));
  }
}
