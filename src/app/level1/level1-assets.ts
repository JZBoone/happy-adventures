import Phaser from "phaser";
import { withAssets } from "../mixins/with-assets";
import { withMap } from "../mixins/with-map";
import { AudioAsset } from "../types/audio";
import { ImageAsset } from "../types/image";
import { Level } from "../types/level";
import { SpriteAsset } from "../types/sprite";

export const groundTypes = [
  ImageAsset.Sand,
  ImageAsset.Water,
  ImageAsset.Forest,
] as const;

export type GroundType = (typeof groundTypes)[number];

export class Level1MapAndAssets extends withMap(
  withAssets(Phaser.Scene, {
    audio: [
      AudioAsset.SandStep,
      AudioAsset.BoardBoat,
      AudioAsset.Splash,
      AudioAsset.CastleOpen,
    ] as const,
    images: [
      ImageAsset.Sand,
      ImageAsset.Water,
      ImageAsset.Boat,
      ImageAsset.Forest,
    ] as const,
    sprites: [SpriteAsset.Castle] as const,
  }),
  {
    level: Level.Level1,
    groundTypes: groundTypes,
    immovableSprites: {
      castle: { asset: SpriteAsset.Castle },
    } as const,
    movableImages: { boat: { asset: ImageAsset.Boat } } as const,
  }
) {}
