import Phaser from "phaser";
import { withMap } from "../mixins/with-map";
import { withAssets } from "../mixins/with-assets";
import { ImageAsset } from "../types/image";
import { Scene } from "../types/scene";
import { SpriteAsset } from "../types/sprite";
import { AudioAsset } from "../types/audio";

export const groundTypes = [
  ImageAsset.Forest,
  ImageAsset.BlackHole,
  ImageAsset.RainbowGlitter,
] as const;

export type GroundType = (typeof groundTypes)[number];

export class Level6MapAndAssets extends withMap(
  withAssets(Phaser.Scene, {
    images: [
      ImageAsset.Forest,
      ImageAsset.BlackHole,
      ImageAsset.RainbowGlitter,
    ] as const,
    sprites: [SpriteAsset.CandyCastle] as const,
    audio: [AudioAsset.Fall, AudioAsset.FunnyCry] as const,
  }),
  {
    level: Scene.Level6,
    groundTypes,
    immovableSprites: {},
    movableSprites: {},
    movableImages: {},
    immovableImageGroups: {},
  } as const
) {}
