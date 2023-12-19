import { ISceneWithAssets } from "../types/assets";
import { AudioAsset } from "../types/audio";
import { ImageAsset } from "../types/image";
import { Coordinates } from "../types/map";
import { SpriteAsset } from "../types/sprite";
import { ImmovableOptions } from "./immovable";
import { Movable } from "./movable";

export class Friend extends Movable<Phaser.GameObjects.Image> {
  mount: Movable<Phaser.GameObjects.Sprite> | null = null;

  private sceneSize: { width: number; height: number };

  constructor(
    public scene: ISceneWithAssets<AudioAsset, ImageAsset, SpriteAsset>,
    public phaserObject: InstanceType<typeof Phaser.GameObjects.Image>,
    options: ImmovableOptions & {
      mapWidth: number;
      mapHeight: number;
    }
  ) {
    super(scene, phaserObject, options);
    this.sceneSize = { width: options.mapWidth, height: options.mapHeight };
    this.initFollow();
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

  mountSprite(
    movable: Movable<Phaser.GameObjects.Sprite>,
    coordinates: Coordinates
  ) {
    this.phaserObject.setVisible(false);
    this.move(coordinates);
    this.mount = movable;
    this.mount.move(coordinates);
  }

  unmountSprite(): Movable<Phaser.GameObjects.Sprite> {
    if (!this.mount) {
      throw new Error("Cannot unmount sprite because it is not mounted");
    }
    const mount = this.mount;
    this.mount = null;
    this.phaserObject.setVisible(true);
    return mount;
  }

  async move(
    coordinates: Coordinates,
    options: { noAnimation?: boolean } = {}
  ): Promise<void> {
    if (!this.mount) {
      return super.move(coordinates, options);
    }
    super.move(coordinates, options);
    return this.mount.move(coordinates, options);
  }

  coordinates() {
    if (this.mount) {
      return this.mount.coordinates();
    }
    return super.coordinates();
  }

  isMoving(): boolean {
    if (!this.mount) {
      return super.isMoving();
    }
    return this.mount.isMoving();
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
