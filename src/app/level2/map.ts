import { ImageAsset } from "../common/image";

const blackHoleCoordinates: [y: number, x: number][] = [
  [0, 3],
  [1, 2],
  [1, 3],
  [1, 4],
  [1, 5],
  [1, 6],
  [2, 0],
  [2, 2],
  [2, 6],
  [2, 13],
  [3, 2],
  [3, 3],
  [3, 6],
  [3, 9],
  [4, 6],
  [5, 1],
  [5, 5],
  [5, 6],
  [5, 13],
  [6, 10],
  [9, 3],
  [9, 12],
  [9, 13],
  [9, 14],
  [9, 15],
  [10, 8],
];

export const groundTypes = [ImageAsset.Stone, ImageAsset.BlackHole];

export type GroundType = (typeof groundTypes)[number];

export const map: GroundType[][] = [];
for (let y = 0; y < 12; y++) {
  if (!map[y]) {
    map.push([]);
  }
  for (let x = 0; x < 16; x++) {
    map[y][x] = ImageAsset.Stone;
  }
}

for (const [y, x] of blackHoleCoordinates) {
  if (!map[y][x]) {
    throw new Error(`Invalid black hole coordinate: x: ${x} y: ${y}`);
  }
  map[y][x] = ImageAsset.BlackHole;
}
