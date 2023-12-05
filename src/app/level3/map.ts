import { ImageAsset } from "../common/image";

export const boneCoordinates: [row: number, position: number][] = [
  [7, 3],
  [8, 2],
  [8, 3],
  [9, 2],
  [9, 3],
  [6, 6],
  [6, 7],
  [5, 11],
  [6, 10],
  [6, 11],
  [7, 11],
  [7, 12],
  [7, 6],
  [7, 7],
  [7, 8],
  [8, 6],
  [8, 8],
  [8, 9],
  [9, 9],
  [9, 10],
  [9, 11],
  [9, 12],
  [9, 13],
  [10, 11],
  [10, 12],
  [10, 13],
  [10, 7],
  [10, 8],
  [11, 7],
  [11, 8],
  [11, 9],
  [11, 10],
  [11, 11],
];

export const heartCoordinates: [row: number, position: number][] = [
  [0, 11],
  [0, 12],
  [1, 11],
  [1, 12],
  [2, 11],
  [2, 12],
  [3, 11],
  [3, 12],
];

export type GroundType = ImageAsset.Goo;

export const map: GroundType[][] = [];
for (let y = 0; y < 12; y++) {
  if (!map[y]) {
    map.push([]);
  }
  for (let x = 0; x < 16; x++) {
    map[y][x] = ImageAsset.Goo;
  }
}
