import Phaser from "phaser";
import { withMap } from "../mixins/with-map";
import { withAssets } from "../mixins/with-assets";
import { ImageAsset } from "../types/image";
import { Scene } from "../types/scene";
import { SpriteAsset } from "../types/sprite";
import { AudioAsset } from "../types/audio";

export const groundTypes = [ImageAsset.SnowBlock] as const;

export type GroundType = (typeof groundTypes)[number];

export const assetOptions = {
  images: [
    ImageAsset.EvilGuy,
    ImageAsset.SpikyGuy,
    ImageAsset.SnowBlock,
    ImageAsset.TunnelMountain,
  ],
  sprites: [SpriteAsset.CandyCastle],
  audio: [AudioAsset.SnowStep, AudioAsset.Tada],
} as const;

export const mapOptions = {
  level: Scene.Level7,
  groundTypes,
  immovableImages: {
    tunnelMountain: { asset: ImageAsset.TunnelMountain },
  },
  immovableSprites: {},
  movableSprites: {},
  movableImages: {},
  immovableImageGroups: {},
} as const;

export class Level7MapAndAssets extends withMap(
  withAssets(Phaser.Scene, assetOptions),
  mapOptions
) {}
