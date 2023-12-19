import { ImageAsset } from "../types/image";

export const groundTypes = [ImageAsset.Goo] as const;

export type GroundType = (typeof groundTypes)[number];
