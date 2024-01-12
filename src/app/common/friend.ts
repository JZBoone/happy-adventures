import { ISceneWithAssets } from "../types/assets";
import { ImmovableOptions } from "./immovable";
import { Movable } from "./movable";

export class Friend extends Movable<Phaser.GameObjects.Image> {
  private sceneSize: { width: number; height: number };

  constructor(
    public scene: ISceneWithAssets,
    public phaserObject: InstanceType<typeof Phaser.GameObjects.Image>,
    options: ImmovableOptions & {
      mapWidth: number;
      mapHeight: number;
      dontFollow?: boolean;
    }
  ) {
    super(scene, phaserObject, options);
    this.sceneSize = { width: options.mapWidth, height: options.mapHeight };
    if (!options.dontFollow) {
      this.initFollow();
    }
  }

  disappear(): Promise<void> {
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.phaserObject,
        scaleX: 0, // Scale horizontally to 0
        scaleY: 0, // Scale vertically to 0
        ease: "Linear", // Use a linear easing
        duration: 2000, // Duration of the tween in milliseconds
        onComplete: () => {
          this.phaserObject.setVisible(false); // Hide the sprite after scaling down
          // reset these so that we can easily make visible again
          this.phaserObject.scaleX = 1;
          this.phaserObject.scaleY = 1;
          resolve();
        },
      });
    });
  }

  private initFollow() {
    this.scene.cameras.main.setBounds(
      0,
      0,
      this.sceneSize.width,
      this.sceneSize.height
    );
    this.scene.cameras.main.startFollow(this.phaserObject, true, 0.05, 0.05);
    this.scene.cameras.main.setDeadzone(100, 100);
  }
}
