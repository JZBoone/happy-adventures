import Phaser from "phaser";
import { withMap } from "../mixins/with-map";
import { withAssets } from "../mixins/with-assets";
import { AudioAsset } from "../types/audio";
import { ImageAsset } from "../types/image";
import { Scene } from "../types/scene";

export const groundTypes = [ImageAsset.Forest] as const;

export type GroundType = (typeof groundTypes)[number];

export const assetOptions = {
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
    ImageAsset.EvilGuy,
    ImageAsset.MagicalCraft,
  ],
  audio: [AudioAsset.Motor, AudioAsset.FunnyCry],
} as const;

export const mapOptions = {
  level: Scene.Level4,
  groundTypes,
  immovableImages: {
    landingPad: { asset: ImageAsset.LandingPad },
    magicTree: { asset: ImageAsset.MagicTree },
  },
  movableImages: { magicalCraft: { asset: ImageAsset.MagicalCraft } },
  immovableImageGroups: {
    trees: { asset: ImageAsset.Tree },
    cactus: { asset: ImageAsset.Cactus },
    boobyTrap: { asset: ImageAsset.BoobyTrap },
    threeSpikes: { asset: ImageAsset.ThreeSpikes },
    mountainSpikes: { asset: ImageAsset.MountainSpikes },
    spikeBench: { asset: ImageAsset.SpikeBench },
    squareSpike: { asset: ImageAsset.SquareSpike },
  },
} as const;

export class Level4MapAndAssets extends withMap(
  withAssets(Phaser.Scene, assetOptions),
  mapOptions
) {}
