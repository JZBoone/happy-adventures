import { ImageAsset } from "../types/image";

export const groundTypes = [ImageAsset.Forest] as const;

export type GroundType = (typeof groundTypes)[number];

export const map: GroundType[][] = [];

for (let y = 0; y < 30; y++) {
  if (!map[y]) {
    map.push([]);
  }
  for (let x = 0; x < 30; x++) {
    map[y][x] = ImageAsset.Forest;
  }
}
