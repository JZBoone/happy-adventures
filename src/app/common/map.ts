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
}): [row: number, position: number] {
  const { x, y, offsetX, offsetY } = params;
  const xNormalized = x + (offsetX ?? 0);
  const yNormalized = y + (offsetY ?? 0);
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
}): [x: number, y: number] {
  const { row, position, offsetX, offsetY } = params;
  return [
    position * mapTileSizePx + halfMapTileSizePx - (offsetX ?? 0),
    row * mapTileSizePx + halfMapTileSizePx - (offsetY ?? 0),
  ];
}
