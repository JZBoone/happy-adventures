import Phaser from "phaser";
import { withAssets } from "../mixins/with-assets";
import { withMap } from "../mixins/with-map";
import { ImageAsset } from "../types/image";
import { AudioAsset } from "../types/audio";
import { Scene } from "../types/scene";
import { SpriteAsset } from "../types/sprite";

export const groundTypes = [
  ImageAsset.MossyStone,
  ImageAsset.MossyWall,
  ImageAsset.FirePit,
] as const;

export type GroundType = (typeof groundTypes)[number];

// Friends from earlier levels, trapped in the cage. Reuses existing art.
const cagedFriends = [
  ImageAsset.Queen,
  ImageAsset.NiceOldLady,
  ImageAsset.SpikyGuy,
] as const;

export const mapOptions = {
  level: Scene.Level7,
  groundTypes,
  immovableSprites: {
    lever: { asset: SpriteAsset.Lever },
  },
  immovableImages: {
    cage: { asset: ImageAsset.Cage },
    queen: { asset: ImageAsset.Queen },
    niceOldLady: { asset: ImageAsset.NiceOldLady },
    spikyGuy: { asset: ImageAsset.SpikyGuy },
  },
} as const;

export const assetOptions = {
  images: [
    ...groundTypes,
    ImageAsset.Ghost,
    ImageAsset.Cage,
    // The Dark Lord — a talking object (Interactable). Edit his message in the
    // map editor by holding shift and clicking him.
    ImageAsset.EvilGuy,
    ...cagedFriends,
  ],
  sprites: [SpriteAsset.Lever],
  audio: [
    AudioAsset.Cheer,
    AudioAsset.Sizzle,
    AudioAsset.FunnyCry,
    AudioAsset.EvilLaughter,
  ],
} as const;

export class Level7MapAndAssets extends withMap(
  withAssets(Phaser.Scene, assetOptions),
  mapOptions
) {}
