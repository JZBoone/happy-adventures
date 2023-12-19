import { ImageAsset } from "../types/image";

export const groundTypes = [ImageAsset.Forest] as const;

export type GroundType = (typeof groundTypes)[number];
