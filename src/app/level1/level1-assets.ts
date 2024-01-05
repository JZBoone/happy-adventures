import Phaser from "phaser";
import { withAssets } from "../mixins/with-assets";
import { withMap } from "../mixins/with-map";
import { AudioAsset } from "../types/audio";
import { ImageAsset } from "../types/image";
import { Scene } from "../types/scene";
import { SpriteAsset } from "../types/sprite";

export const groundTypes = [
  ImageAsset.Sand,
  ImageAsset.SandUp,
  ImageAsset.SandDown,
  ImageAsset.SandLeft,
  ImageAsset.SandRight,
  ImageAsset.Water,
  ImageAsset.Forest,
] as const;

export type GroundType = (typeof groundTypes)[number];

export const mapOptions = {
  level: Scene.Level1,
  groundTypes: groundTypes,
  immovableSprites: {
    castle: { asset: SpriteAsset.Castle },
  },
  movableImages: { boat: { asset: ImageAsset.Boat } },
} as const;

export const assetOptions = {
  audio: [
    AudioAsset.SandStep,
    AudioAsset.BoardBoat,
    AudioAsset.Splash,
    AudioAsset.CastleOpen,
  ],
  images: [
    ImageAsset.Sand,
    ImageAsset.SandUp,
    ImageAsset.SandDown,
    ImageAsset.SandLeft,
    ImageAsset.SandRight,
    ImageAsset.Water,
    ImageAsset.Boat,
    ImageAsset.Forest,
  ],
  sprites: [SpriteAsset.Castle],
} as const;

export class Level1MapAndAssets extends withMap(
  withAssets(Phaser.Scene, assetOptions),
  mapOptions
) {}
