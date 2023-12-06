import { ImageAsset } from "./image";
import { Move } from "../mixins/with-map";

export const mapTileSizePx = 50;
export const halfMapTileSizePx = mapTileSizePx / 2;

export const playStartCoordinates: [x: number, y: number] = [
  halfMapTileSizePx,
  halfMapTileSizePx,
];

export function loadMap(scene: Phaser.Scene, map: ImageAsset[][]) {
  map.forEach((row, rowIndex) => {
    row.forEach((groundType, positionIndex) => {
      scene.add.image(
        positionIndex * mapTileSizePx + halfMapTileSizePx,
        rowIndex * mapTileSizePx + halfMapTileSizePx,
        groundType
      );
    });
  });
}

export function mapCoordinates(params: {
  x: number;
  y: number;
  offsetX?: number;
  offsetY?: number;
  height?: number;
  width?: number;
}): [row: number, position: number] {
  const { x, y, offsetX, offsetY, height, width } = params;
  const xNormalized =
    x + (offsetX ?? 0) + ((width ?? 1) - 1) * halfMapTileSizePx;
  const yNormalized =
    y + (offsetY ?? 0) + ((height ?? 1) - 1) * halfMapTileSizePx;
  const index = (normalizedXorY: number) => {
    if (normalizedXorY === halfMapTileSizePx) {
      return 0;
    }
    return (normalizedXorY - halfMapTileSizePx) / mapTileSizePx;
  };
  return [index(yNormalized), index(xNormalized)];
}

export function moveCoordinates(
  move: Move,
  row: number,
  position: number
): [row: number, position: number] {
  switch (move) {
    case "up":
      return [row - 1, position];
    case "down":
      return [row + 1, position];
    case "left":
      return [row, position - 1];
    case "right":
      return [row, position + 1];
  }
}

export function worldPosition(params: {
  row: number;
  position: number;
  offsetX?: number;
  offsetY?: number;
  height?: number;
  width?: number;
}): [x: number, y: number] {
  const { row, position, offsetX, offsetY, height, width } = params;
  return [
    position * mapTileSizePx +
      halfMapTileSizePx -
      (offsetX ?? 0) -
      ((width ?? 1) - 1) * halfMapTileSizePx,
    row * mapTileSizePx +
      halfMapTileSizePx -
      (offsetY ?? 0) -
      ((height ?? 1) - 1) * halfMapTileSizePx,
  ];
}
