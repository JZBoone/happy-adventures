import Phaser from "phaser";

export enum SpriteAsset {
  Castle = "castle",
  Friend = "friend",
}

export const SpriteAssets: Record<
  SpriteAsset,
  { path: string; frameConfig: Phaser.Types.Loader.FileTypes.ImageFrameConfig }
> = {
  [SpriteAsset.Castle]: {
    path: "assets/image/castle.png",
    frameConfig: {
      frameWidth: 168,
      frameHeight: 139,
    },
  },
  [SpriteAsset.Friend]: {
    path: "assets/image/friend.png",
    frameConfig: {
      frameWidth: 32,
      frameHeight: 48,
    },
  },
};
