import { ImageAsset } from "../types/image";

export type GroundType = ImageAsset.Sand | ImageAsset.Water | ImageAsset.Forest;

export const map: GroundType[][] = [];

for (let i = 0; i < 38; i++) {
  if (!map[i]) {
    map.push([]);
  }
  for (let j = 0; j < 52; j++) {
    map[i][j] = ImageAsset.Water;
  }
}

map[0][0] = ImageAsset.Sand;
map[0][1] = ImageAsset.Forest;
