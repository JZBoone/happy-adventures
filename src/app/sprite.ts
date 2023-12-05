import Phaser from "phaser";

export enum SpriteAsset {
  Castle = "castle",
}

export const SpriteAssets: Record<
  SpriteAsset,
  { path: string; frameConfig: Phaser.Types.Loader.FileTypes.ImageFrameConfig }
> = {
  [SpriteAsset.Castle]: {
    path: "assets/image/castle.png",
    frameConfig: {
      frameWidth: 170,
      frameHeight: 139,
    },
  },
};
