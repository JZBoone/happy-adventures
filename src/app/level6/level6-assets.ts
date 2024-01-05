import Phaser from "phaser";
import { withMap } from "../mixins/with-map";
import { withAssets } from "../mixins/with-assets";
import { ImageAsset } from "../types/image";
import { Scene } from "../types/scene";
import { SpriteAsset } from "../types/sprite";
import { AudioAsset } from "../types/audio";

export const groundTypes = [
  ImageAsset.BlackHole,
  ImageAsset.Forest,
  ImageAsset.RainbowGlitter,
] as const;

export type GroundType = (typeof groundTypes)[number];

export const assetOptions = {
  images: [ImageAsset.Forest, ImageAsset.BlackHole, ImageAsset.RainbowGlitter],
  sprites: [SpriteAsset.CandyCastle],
  audio: [AudioAsset.Fall, AudioAsset.FunnyCry],
} as const;

export const mapOptions = {
  level: Scene.Level6,
  groundTypes,
  immovableSprites: {},
  movableSprites: {},
  movableImages: {},
  immovableImageGroups: {},
} as const;

export class Level6MapAndAssets extends withMap(
  withAssets(Phaser.Scene, assetOptions),
  mapOptions
) {}
