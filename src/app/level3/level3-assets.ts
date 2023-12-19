import Phaser from "phaser";
import { ImageAsset } from "../types/image";
import { withMap } from "../mixins/with-map";
import { withAssets } from "../mixins/with-assets";
import { AudioAsset } from "../types/audio";
import { Level } from "../types/level";

export const groundTypes = [ImageAsset.Goo] as const;

export type GroundType = (typeof groundTypes)[number];

export class Level3MapAndAssets extends withMap(
  withAssets(Phaser.Scene, {
    images: [
      ImageAsset.Goo,
      ImageAsset.Heart,
      ImageAsset.Lungs,
      ImageAsset.Bones,
      ImageAsset.Elasmosaurus,
      ImageAsset.SmallElasmosaurus,
      ImageAsset.Bomb,
    ] as const,
    audio: [
      AudioAsset.Grunt,
      AudioAsset.Explosion,
      AudioAsset.Crunch,
      AudioAsset.Splat,
    ] as const,
  }),
  {
    level: Level.Level3,
    groundTypes,
    immovableImages: {
      lungs: { asset: ImageAsset.Lungs },
      heart: { asset: ImageAsset.Heart },
      elasmosaurus: { asset: ImageAsset.Elasmosaurus },
      smallElasmosaurus: { asset: ImageAsset.SmallElasmosaurus },
    } as const,
    immovableImageGroups: {
      bones: { asset: ImageAsset.Bones },
    } as const,
  }
) {}
