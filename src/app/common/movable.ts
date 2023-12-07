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

export class Friend extends Movable<Phaser.GameObjects.Image> {
  mount: Movable<Phaser.GameObjects.Sprite> | null = null;

  disappear() {
    this.scene.tweens.add({
      targets: this.movable,
      scaleX: 0, // Scale horizontally to 0
      scaleY: 0, // Scale vertically to 0
      ease: "Linear", // Use a linear easing
      duration: 2000, // Duration of the tween in milliseconds
      onComplete: () => {
        this.movable.setVisible(false); // Hide the sprite after scaling down
      },
    });
  }

  mountSprite(
    movable: Movable<Phaser.GameObjects.Sprite>,
    coordinates: Coordinates
  ) {
    this.movable.setVisible(false);
    this.mount = movable;
    this.mount.move(coordinates);
  }

  unmountSprite(): Movable<Phaser.GameObjects.Sprite> {
    if (!this.mount) {
      throw new Error("Cannot unmount sprite because it is not mounted");
    }
    const mount = this.mount;
    this.mount = null;
    this.movable.setVisible(true);
    return mount;
  }

  async move(
    coordinates: Coordinates,
    options: { noAnimation?: boolean } = {}
  ): Promise<void> {
    if (!this.mount) {
      return super.move(coordinates, options);
    }
    return this.mount.move(coordinates, options);
  }

  coordinates() {
    if (!this.mount) {
      return super.coordinates();
    }
    return mapCoordinates({
      x: this.mount.movable.x,
      y: this.mount.movable.y,
      offsetX: this.mount.offsetX,
      offsetY: this.mount.offsetY,
      height: this.mount.height,
      width: this.mount.width,
    });
  }

  isMoving(): boolean {
    if (!this.mount) {
      return super.isMoving();
    }
    return this.mount.isMoving();
  }
}
