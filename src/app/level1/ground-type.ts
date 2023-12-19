import { ImageAsset } from "../types/image";

export const groundTypes = [
  ImageAsset.Sand,
  ImageAsset.Water,
  ImageAsset.Forest,
] as const;

export type GroundType = (typeof groundTypes)[number];

export const map: GroundType[][] = [];
