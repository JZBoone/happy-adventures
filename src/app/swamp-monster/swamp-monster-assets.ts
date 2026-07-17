import Phaser from "phaser";
import { withAssets } from "../mixins/with-assets";
import { withMap } from "../mixins/with-map";
import { ImageAsset } from "../types/image";
import { AudioAsset } from "../types/audio";
import { Scene } from "../types/scene";
import { SpriteAsset } from "../types/sprite";

export const groundTypes = [
  ImageAsset.Goo,
  ImageAsset.SwampWater,
  ImageAsset.Fungus,
] as const;

export type GroundType = (typeof groundTypes)[number];

export const mapOptions = {
  level: Scene.SwampMonster,
  groundTypes,
  immovableSprites: {
    lever: { asset: SpriteAsset.Lever },
  },
  immovableImages: {
    // Declared before the dynamite so the dynamite renders on top of it.
    goblinCastle: { asset: ImageAsset.SwampMonsterCastle },
    dynamite: { asset: ImageAsset.Tnt },
  },
  movableImages: {
    swampMonster: { asset: ImageAsset.Monster },
  },
} as const;

export const assetOptions = {
  images: [
    ...groundTypes,
    ImageAsset.SwampMonsterCastle,
    ImageAsset.Tnt,
    ImageAsset.Monster,
    // The living computer — a talking object (Interactable). Edit its message
    // in the map editor by holding shift and clicking it.
    ImageAsset.LivingComputer,
  ],
  sprites: [SpriteAsset.Lever],
  audio: [AudioAsset.Chomp, AudioAsset.Explosion, AudioAsset.Cheer],
} as const;

export class SwampMonsterMapAndAssets extends withMap(
  withAssets(Phaser.Scene, assetOptions),
  mapOptions
) {}
