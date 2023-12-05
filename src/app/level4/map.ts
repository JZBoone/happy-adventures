import { ImageAsset } from "../image";

export const map: ImageAsset.Forest[][] = [];

for (let y = 0; y < 12; y++) {
  if (!map[y]) {
    map.push([]);
  }
  for (let x = 0; x < 16; x++) {
    map[y][x] = ImageAsset.Forest;
  }
}
