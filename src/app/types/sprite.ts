import { AudioAsset } from "./audio";

export enum SpriteAsset {
  Castle = "castle",
  MiniPlane = "mini-plane",
  CandyCastle = "candy-castle",
}

export enum CastleAnimation {
  Open = "castle.open",
  Close = "castle.close",
}

export enum CandyCastleAnimation {
  Open = "candy-castle.open",
  Close = "candy-castle.close",
}

export enum MiniPlaneAnimation {
  Fly = "mini-plane.fly",
}

export type CastleFrame = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type CandyCastleFrame = 0 | 1 | 2 | 3 | 4 | 5;

export type MiniPlaneFrame = 0 | 1 | 2 | 3;

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
      sprite.on("animationstart", (anim: { key: string }) => {
        if (anim.key === CastleAnimation.Open) {
          scene.sound.play(AudioAsset.CastleOpen);
        }
      });
    },
  },
  [SpriteAsset.CandyCastle]: {
    path: "assets/image/candy-castle.png",
    frameConfig: {
      frameWidth: 400,
      frameHeight: 391,
    },
    audioAssets: [AudioAsset.CastleOpen],
    anims: (scene, sprite) => {
      if (!scene.anims.exists(CandyCastleAnimation.Open)) {
        scene.anims.create({
          key: CandyCastleAnimation.Open,
          frames: scene.anims.generateFrameNumbers(SpriteAsset.CandyCastle, {
            start: 0 satisfies CandyCastleFrame,
            end: 5 satisfies CandyCastleFrame,
          }),
          frameRate: 15,
          repeat: 0,
        });

        scene.anims.create({
          key: CandyCastleAnimation.Close,
          frames: scene.anims.generateFrameNumbers(SpriteAsset.CandyCastle, {
            start: 5 satisfies CandyCastleFrame,
            end: 0 satisfies CandyCastleFrame,
          }),
          frameRate: 15,
          repeat: 0,
        });
      }
      sprite.on("animationstart", (anim: { key: string }) => {
        if (anim.key === CandyCastleAnimation.Open) {
          scene.sound.play(AudioAsset.CastleOpen);
        }
      });
    },
  },
  [SpriteAsset.MiniPlane]: {
    path: "assets/image/mini-plane.png",
    frameConfig: {
      frameWidth: 101,
      frameHeight: 85.47,
    },
    anims: (scene) => {
      if (!scene.anims.exists(MiniPlaneAnimation.Fly)) {
        scene.anims.create({
          key: MiniPlaneAnimation.Fly,
          frames: scene.anims.generateFrameNumbers(SpriteAsset.MiniPlane, {
            start: 1 satisfies MiniPlaneFrame,
            end: 3 satisfies MiniPlaneFrame,
          }),
          frameRate: 50,
          repeat: -1,
        });
      }
    },
  },
};

export const defaultSprites = [SpriteAsset.MiniPlane] as const;
export type DefaultSpriteAsset = (typeof defaultSprites)[number];
