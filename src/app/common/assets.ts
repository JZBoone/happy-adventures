import Phaser from "phaser";
import { ImageAsset } from "../types/image";
import { AudioAsset } from "../types/audio";
import { SpriteAsset, SpriteAssets } from "../types/sprite";

export function loadImages(scene: Phaser.Scene, assets: readonly ImageAsset[]) {
  for (const asset of assets) {
    scene.load.image(asset, `${process.env.API_URL}/assets/image/${asset}.png`);
  }
}

export function loadAudio(scene: Phaser.Scene, assets: readonly AudioAsset[]) {
  for (const asset of assets) {
    scene.load.audio(asset, `${process.env.API_URL}/assets/audio/${asset}.mp3`);
  }
}

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
