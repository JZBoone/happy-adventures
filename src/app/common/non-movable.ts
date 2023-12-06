import { mapCoordinates } from "./map";

export class NonMovable<
  T extends
    | InstanceType<typeof Phaser.GameObjects.Image>
    | InstanceType<typeof Phaser.GameObjects.Sprite>,
> {
  height = 1;
  width = 1;

  __offsetX = 0;
  __offsetY = 0;

  get offsetY() {
    return this.__offsetY;
  }
  get offsetX() {
    return this.__offsetX;
  }

  constructor(
    public nonMovable: T,
    options?: {
      offsetX?: number;
      offsetY?: number;
      height?: number;
      width?: number;
    }
  ) {
    this.__offsetX = options?.offsetX ?? 0;
    this.__offsetY = options?.offsetY ?? 0;
    this.height = options?.height ?? 1;
    this.width = options?.width ?? 1;
  }

  coordinates() {
    return mapCoordinates({
      x: this.nonMovable.x,
      y: this.nonMovable.y,
      offsetX: this.offsetX,
      offsetY: this.offsetY,
      height: this.height,
      width: this.width,
    });
  }

  private isAtRow(row: number) {
    const [actualRow] = this.coordinates();
    if (actualRow === row) {
      return true;
    }
    if (this.height === 1) {
      return false;
    }
    const adjacentRows = this.height - 1;
    return actualRow > row && actualRow <= row + adjacentRows;
  }

  private isAtPosition(position: number) {
    const [, actualPosition] = this.coordinates();
    if (actualPosition === position) {
      return true;
    }
    if (this.height === 1) {
      return false;
    }
    const adjacentPositions = this.height - 1;
    return (
      actualPosition > position &&
      actualPosition <= position + adjacentPositions
    );
  }

  isAt(row: number, position: number): boolean {
    return this.isAtRow(row) && this.isAtPosition(position);
  }
}
