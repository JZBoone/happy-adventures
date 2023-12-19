import { ImageAsset } from "../types/image";

export const groundTypes = [ImageAsset.Stone, ImageAsset.BlackHole] as const;

export type GroundType = (typeof groundTypes)[number];
