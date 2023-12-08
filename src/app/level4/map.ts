import { ImageAsset } from "../types/image";

export type GroundType = ImageAsset.Forest | ImageAsset.LandingPad;

export const map: GroundType[][] = [];

for (let y = 0; y < 30; y++) {
  if (!map[y]) {
    map.push([]);
  }
  for (let x = 0; x < 30; x++) {
    map[y][x] = ImageAsset.Forest;
  }
}
