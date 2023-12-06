import { mapCoordinates, worldPosition } from "./map";
import { NonMovable } from "./non-movable";

export class Movable<
  T extends
    | InstanceType<typeof Phaser.GameObjects.Image>
    | InstanceType<typeof Phaser.GameObjects.Sprite>,
> extends NonMovable<T> {
  private movingTween?: Phaser.Tweens.Tween;

  setOffsetY(value: number) {
    const [row, position] = this.coordinates();
    this.__offsetY = value;
    this.move(row, position);
  }
  setOffsetX(value: number) {
    const [row, position] = this.coordinates();
    this.__offsetX = value;
    this.move(row, position);
  }
  constructor(
    public scene: Phaser.Scene,
    public movable: T,
    options?: { offsetX?: number; offsetY?: number }
  ) {
    super(movable, options);
  }

  coordinates() {
    return mapCoordinates({
      x: this.movable.x,
      y: this.movable.y,
      offsetX: this.offsetX,
      offsetY: this.offsetY,
    });
  }

  move(row: number, position: number) {
    const [x, y] = worldPosition({
      row,
      position,
      offsetX: this.offsetX,
      offsetY: this.offsetY,
    });
    this.movingTween = this.scene.tweens.add({
      targets: this.movable,
      x,
      y,
      ease: "Linear",
      duration: 200,
      repeat: 0,
      yoyo: false,
    });
  }

  isMoving(): boolean {
    if (!this.movingTween) {
      return false;
    }
    return this.movingTween.isPlaying();
  }
}
