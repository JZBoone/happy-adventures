import Phaser from "phaser";
import { withMap } from "../mixins/with-map";
import { withAssets } from "../mixins/with-assets";
import { ImageAsset } from "../types/image";
import { Level } from "../types/level";
import { AudioAsset } from "../types/audio";
import { SpriteAsset } from "../types/sprite";

export const groundTypes = [
  ImageAsset.RainbowGlitter,
  ImageAsset.CrackedRainbowGlitter,
  ImageAsset.BlackHole,
] as const;

export type GroundType = (typeof groundTypes)[number];

export class Level5MapAndAssets extends withMap(
  withAssets(Phaser.Scene, {
    images: [
      ImageAsset.RainbowGlitter,
      ImageAsset.CrackedRainbowGlitter,
      ImageAsset.Lollipop,
      ImageAsset.GumDrop,
      ImageAsset.Peppermint,
      ImageAsset.NiceOldLady,
      ImageAsset.BlackHole,
      ImageAsset.MagicLollipopKey,
    ] as const,
    sprites: [SpriteAsset.CandyCastle] as const,
    audio: [
      AudioAsset.RockDestroy,
      AudioAsset.Twinkle,
      AudioAsset.SparklingStar,
      AudioAsset.SuccessBell,
    ] as const,
  }),
  {
    level: Level.Level5,
    groundTypes,
    immovableSprites: { candyCastle: { asset: SpriteAsset.CandyCastle } },
    movableSprites: {},
    movableImages: {
      magicLollipopKey: { asset: ImageAsset.MagicLollipopKey },
    },
    immovableImageGroups: {
      lollipops: { asset: ImageAsset.Lollipop },
      gumdrops: { asset: ImageAsset.GumDrop },
      peppermints: { asset: ImageAsset.GumDrop },
    },
  } as const
) {}
