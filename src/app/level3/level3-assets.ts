import Phaser from "phaser";
import { ImageAsset } from "../types/image";
import { withMap } from "../mixins/with-map";
import { withAssets } from "../mixins/with-assets";
import { AudioAsset } from "../types/audio";
import { Scene } from "../types/scene";

export const groundTypes = [ImageAsset.Goo, ImageAsset.PurpleAcid] as const;

export type GroundType = (typeof groundTypes)[number];

export const assetOptions = {
  images: [
    ImageAsset.Goo,
    ImageAsset.Heart,
    ImageAsset.Lungs,
    ImageAsset.Bones,
    ImageAsset.Elasmosaurus,
    ImageAsset.SmallElasmosaurus,
    ImageAsset.Bomb,
    ImageAsset.PurpleAcid,
  ],
  audio: [
    AudioAsset.Grunt,
    AudioAsset.Explosion,
    AudioAsset.Crunch,
    AudioAsset.Splat,
    AudioAsset.Sizzle,
  ],
} as const;

export const mapOptions = {
  level: Scene.Level3,
  groundTypes,
  immovableImages: {
    lungs: { asset: ImageAsset.Lungs },
    heart: { asset: ImageAsset.Heart },
    elasmosaurus: { asset: ImageAsset.Elasmosaurus },
    smallElasmosaurus: { asset: ImageAsset.SmallElasmosaurus },
  },
  immovableImageGroups: {
    bones: { asset: ImageAsset.Bones },
  },
  movableImages: { bomb: { asset: ImageAsset.Bomb } },
} as const;

export class Level3MapAndAssets extends withMap(
  withAssets(Phaser.Scene, assetOptions),
  mapOptions
) {}
