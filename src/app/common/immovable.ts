import { Coordinates } from "../types/maps";
import { mapCoordinates, worldPosition } from "./map";

export class Immovable<
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
    public immovable: T,
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
      x: this.immovable.x,
      y: this.immovable.y,
      offsetX: this.offsetX,
      offsetY: this.offsetY,
      height: this.height,
      width: this.width,
    });
  }

  move(coordinates: Coordinates) {
    const [x, y] = worldPosition({
      coordinates,
      offsetX: this.offsetX,
      offsetY: this.offsetY,
      width: this.width,
      height: this.height,
    });
    this.immovable.x = x;
    this.immovable.y = y;
  }

  private occupiesRow(row: number) {
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

  private occupiesPosition(position: number) {
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

  isAt([row, position]: Coordinates): boolean {
    const [actualRow, actualPosition] = this.coordinates();
    return actualRow === row && actualPosition === position;
  }

  occupies([row, position]: Coordinates): boolean {
    return this.occupiesRow(row) && this.occupiesPosition(position);
  }
}
