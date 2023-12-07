import Phaser from "phaser";
import { AudioAsset, loadAudio } from "./audio";

export enum SpriteAsset {
  Castle = "castle",
}

export enum CastleAnimation {
  Open = "castle.open",
  Close = "castle.close",
}

export type CastleFrame = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const SpriteAssets: Record<
  SpriteAsset,
  {
    path: string;
    frameConfig: Phaser.Types.Loader.FileTypes.ImageFrameConfig;
    audioAssets?: AudioAsset[];
    anims: (scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite) => void;
  }
> = {
  [SpriteAsset.Castle]: {
    path: "assets/image/castle.png",
    frameConfig: {
      frameWidth: 170,
      frameHeight: 139,
    },
    audioAssets: [AudioAsset.CastleOpen],
    anims: (scene, sprite) => {
      if (!scene.anims.exists(CastleAnimation.Open)) {
        scene.anims.create({
          key: CastleAnimation.Open,
          frames: scene.anims.generateFrameNumbers(SpriteAsset.Castle, {
            start: 0 satisfies CastleFrame,
            end: 6 satisfies CastleFrame,
          }),
          frameRate: 15,
          repeat: 0,
        });

        scene.anims.create({
          key: CastleAnimation.Close,
          frames: scene.anims.generateFrameNumbers(SpriteAsset.Castle, {
            start: 6 satisfies CastleFrame,
            end: 0 satisfies CastleFrame,
          }),
          frameRate: 15,
          repeat: 0,
        });
      }
      sprite.on("animationstart", (anim: any) => {
        if (anim.key === CastleAnimation.Open) {
          scene.sound.play(AudioAsset.CastleOpen);
        }
      });
    },
  },
};

export function loadSprites(
  scene: Phaser.Scene,
  assets: readonly SpriteAsset[]
) {
  for (const asset of assets) {
    if (!SpriteAssets[asset]) {
      throw new Error(`Sprite ${asset} not recognized`);
    }
    scene.load.spritesheet(
      asset,
      `${process.env.API_URL}/${SpriteAssets[asset].path}`,
      SpriteAssets[asset].frameConfig
    );
    loadAudio(scene, SpriteAssets[asset].audioAssets || []);
  }
}
