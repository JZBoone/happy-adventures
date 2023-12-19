import Phaser from "phaser";
import { withMap } from "../mixins/with-map";
import { withAssets } from "../mixins/with-assets";
import { AudioAsset } from "../types/audio";
import { ImageAsset } from "../types/image";
import { Level } from "../types/level";
import { SpriteAsset } from "../types/sprite";

export const groundTypes = [ImageAsset.Forest] as const;

export type GroundType = (typeof groundTypes)[number];

export class Level4MapAndAssets extends withMap(
  withAssets(Phaser.Scene, {
    images: [
      ImageAsset.Forest,
      ImageAsset.LandingPad,
      ImageAsset.Tree,
      ImageAsset.MagicTree,
      ImageAsset.Cactus,
      ImageAsset.BoobyTrap,
      ImageAsset.ThreeSpikes,
      ImageAsset.MountainSpikes,
      ImageAsset.SpikeBench,
      ImageAsset.SquareSpike,
      ImageAsset.SpikyGuy,
      ImageAsset.LittleSister,
    ] as const,
    audio: [AudioAsset.Motor] as const,
  }),
  {
    level: Level.Level4,
    groundTypes,
    immovableImages: {
      landingPad: { asset: ImageAsset.LandingPad },
      magicTree: { asset: ImageAsset.MagicTree },
    },
    movableSprites: { miniPlane: { asset: SpriteAsset.MiniPlane } },
    immovableImageGroups: {
      trees: { asset: ImageAsset.Tree },
      cactus: { asset: ImageAsset.Cactus },
      boobyTrap: { asset: ImageAsset.BoobyTrap },
      threeSpikes: { asset: ImageAsset.ThreeSpikes },
      mountainSpikes: { asset: ImageAsset.MountainSpikes },
      spikeBench: { asset: ImageAsset.SpikeBench },
      squareSpike: { asset: ImageAsset.SquareSpike },
    },
  }
) {}
