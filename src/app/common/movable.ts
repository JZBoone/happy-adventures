import { mapCoordinates, worldPosition } from "./map";

export class Movable<
  T extends
    | InstanceType<typeof Phaser.GameObjects.Image>
    | InstanceType<typeof Phaser.GameObjects.Sprite>,
> {
  private movingTween?: Phaser.Tweens.Tween;

  private _offsetX = 0;
  private _offsetY = 0;

  setOffsetY(value: number) {
    const [row, position] = this.coordinates();
    this._offsetY = value;
    this.move(row, position);
  }
  setOffsetX(value: number) {
    const [row, position] = this.coordinates();
    this._offsetX = value;
    this.move(row, position);
  }

  get offsetY() {
    return this._offsetY;
  }
  get offsetX() {
    return this._offsetX;
  }

  constructor(
    private scene: Phaser.Scene,
    public movable: T,
    options?: { offsetX?: number; offsetY?: number }
  ) {
    this._offsetX = options?.offsetX ?? 0;
    this._offsetY = options?.offsetY ?? 0;
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

  isAt(row: number, position: number): boolean {
    const coordinates = this.coordinates();
    return row === coordinates[0] && position === coordinates[1];
  }
}
