import { ImageAsset } from "../types/image";

export const groundTypes = [ImageAsset.Stone, ImageAsset.BlackHole] as const;

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
