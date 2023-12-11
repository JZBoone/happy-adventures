import { ImageAsset } from "../types/image";
import { Coordinates, Move } from "../types/map";

export const mapTileSizePx = 50;
export const halfMapTileSizePx = mapTileSizePx / 2;

export const playStartCoordinates: Coordinates = [
  halfMapTileSizePx,
  halfMapTileSizePx,
];

export function createMapImage(
  scene: Phaser.Scene,
  params: { asset: ImageAsset; coordinates: Coordinates }
) {
  const { asset, coordinates } = params;
  return scene.add.image(
    coordinates[1] * mapTileSizePx + halfMapTileSizePx,
    coordinates[0] * mapTileSizePx + halfMapTileSizePx,
    asset
  );
}

export function loadMap(scene: Phaser.Scene, map: ImageAsset[][]) {
  return map.map((row, rowIndex) =>
    row.map((asset, positionIndex) => ({
      asset,
      image: createMapImage(scene, {
        asset,
        coordinates: [rowIndex, positionIndex],
      }),
    }))
  );
}

export function mapCoordinates(params: {
  x: number;
  y: number;
  offsetX?: number;
  offsetY?: number;
  height?: number;
  width?: number;
}): Coordinates {
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
  coordinates: Coordinates
): Coordinates {
  const [row, position] = coordinates;
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
  coordinates: Coordinates;
  offsetX?: number;
  offsetY?: number;
  height?: number;
  width?: number;
}): [x: number, y: number] {
  const { coordinates, offsetX, offsetY, height, width } = params;
  const [row, position] = coordinates;
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

export function pointerCoordinates(pointer: {
  x: number;
  y: number;
}): Coordinates {
  const { x, y } = pointer;
  const row = Math.floor(y / mapTileSizePx);
  const position = Math.floor(x / mapTileSizePx);
  return [row, position];
}
