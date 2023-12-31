import Phaser from "phaser";
import { withAssets } from "../mixins/with-assets";
import { withMap } from "../mixins/with-map";
import { ImageAsset } from "../types/image";
import { AudioAsset } from "../types/audio";
import { Scene } from "../types/scene";

export const groundTypes = [ImageAsset.Stone, ImageAsset.BlackHole] as const;

export type GroundType = (typeof groundTypes)[number];

export const mapOptions = {
  level: Scene.Level2,
  groundTypes,
  immovableImages: {
    monster: { asset: ImageAsset.Monster },
    portal: { asset: ImageAsset.Portal },
  },
} as const;

export const assetOptions = {
  images: [
    ...groundTypes,
    ImageAsset.Monster,
    ImageAsset.Portal,
    ImageAsset.Queen,
    ImageAsset.MonsterGuts,
  ],
  audio: [
    AudioAsset.Chomp,
    AudioAsset.Fall,
    AudioAsset.Stomp,
    AudioAsset.Whoosh,
  ],
} as const;

export class Level2MapAndAssets extends withMap(
  withAssets(Phaser.Scene, assetOptions),
  mapOptions
) {}
