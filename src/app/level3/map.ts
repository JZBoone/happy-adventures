import { ImageAsset } from "../types/image";

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
