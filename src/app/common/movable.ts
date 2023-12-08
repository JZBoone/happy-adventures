import { ISceneWithAssets } from "../types/assets";
import { AudioAsset } from "../types/audio";
import { ImageAsset } from "../types/image";
import { Coordinates } from "../types/maps";
import { SpriteAsset } from "../types/sprite";
import { mapCoordinates, worldPosition } from "./map";
import { Immovable } from "./immovable";

export class Movable<
  T extends
    | InstanceType<typeof Phaser.GameObjects.Image>
    | InstanceType<typeof Phaser.GameObjects.Sprite>,
> extends Immovable<T> {
  private movingTween?: Phaser.Tweens.Tween;

  setOffsetY(value: number) {
    const coordinates = this.coordinates();
    this.__offsetY = value;
    this.move(coordinates);
  }
  setOffsetX(value: number) {
    const coordinates = this.coordinates();
    this.__offsetX = value;
    this.move(coordinates);
  }
  constructor(
    public scene: ISceneWithAssets<AudioAsset, ImageAsset, SpriteAsset>,
    public movable: T,
    options?: {
      offsetX?: number;
      offsetY?: number;
      height?: number;
      width?: number;
    }
  ) {
    super(movable, options);
  }

  async move(
    coordinates: Coordinates,
    options: { noAnimation?: boolean } = {}
  ): Promise<void> {
    return new Promise((resolve) => {
      const [x, y] = worldPosition({
        coordinates,
        offsetX: this.offsetX,
        offsetY: this.offsetY,
        width: this.width,
        height: this.height,
      });
      if (options.noAnimation) {
        this.movable.x = x;
        this.movable.y = y;
        return resolve();
      }
      this.movingTween = this.scene.tweens.add({
        targets: this.movable,
        x,
        y,
        ease: "Linear",
        duration: 200,
        repeat: 0,
        yoyo: false,
        onComplete: () => resolve(),
      });
    });
  }

  coordinates() {
    return mapCoordinates({
      x: this.movable.x,
      y: this.movable.y,
      offsetX: this.offsetX,
      offsetY: this.offsetY,
      height: this.height,
      width: this.width,
    });
  }

  isMoving(): boolean {
    if (!this.movingTween) {
      return false;
    }
    return this.movingTween.isPlaying();
  }
}
