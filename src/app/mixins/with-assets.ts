import Phaser from "phaser";
import { AudioAsset, loadAudio } from "../common/audio";
import { ImageAsset, loadImages } from "../common/image";
import { SpriteAsset, SpriteAssets, loadSprites } from "../common/sprite";
import { SceneClass } from "./common";

export interface ISceneWithAssets<
  SceneAudioAsset extends AudioAsset,
  SceneImageAsset extends ImageAsset,
  SceneSpriteAsset extends SpriteAsset,
> extends Phaser.Scene {
  audio: readonly SceneAudioAsset[];
  images: readonly SceneImageAsset[];
  sprites: readonly SceneSpriteAsset[];
  createImage(
    x: number,
    y: number,
    texture: SceneImageAsset,
    frame?: string | number
  ): Phaser.GameObjects.Image;
  createSprite(
    x: number,
    y: number,
    texture: SceneSpriteAsset,
    frame?: string | number
  ): Phaser.GameObjects.Sprite;
  playAudio(asset: SceneAudioAsset): void;
}

export function withAssets<
  TBase extends SceneClass,
  SceneAudioAsset extends AudioAsset,
  SceneImageAsset extends ImageAsset,
  SceneSpriteAsset extends SpriteAsset,
>(
  Base: TBase,
  assets: {
    audio?: readonly SceneAudioAsset[];
    images?: readonly SceneImageAsset[];
    sprites?: readonly SceneSpriteAsset[];
  } = {}
) {
  return class SceneWithAssets
    extends Base
    implements
      ISceneWithAssets<SceneAudioAsset, SceneImageAsset, SceneSpriteAsset>
  {
    audio: readonly SceneAudioAsset[] = assets?.audio || [];
    images: readonly SceneImageAsset[] = assets?.images || [];
    sprites: readonly SceneSpriteAsset[] = assets?.sprites || [];

    preload() {
      loadAudio(this, [...(assets.audio || []), AudioAsset.Thump]);
      if (assets.images) {
        loadImages(this, assets.images);
      }
      if (assets.sprites) {
        loadSprites(this, assets.sprites);
      }
    }

    playAudio(asset: SceneAudioAsset) {
      if (!this.audio.includes(asset)) {
        throw new Error(`Audio not loaded. Did you forget to load ${asset}?`);
      }
      this.sound.play(asset);
    }

    createImage(
      x: number,
      y: number,
      texture: SceneImageAsset,
      frame?: string | number
    ): Phaser.GameObjects.Image {
      if (!this.images.includes(texture)) {
        throw new Error(`Image not loaded. Did you forget to load ${texture}?`);
      }
      return this.add.image(x, y, texture, frame);
    }

    createSprite(
      x: number,
      y: number,
      texture: SceneSpriteAsset,
      frame?: string | number
    ): Phaser.GameObjects.Sprite {
      if (!this.sprites.includes(texture)) {
        throw new Error(
          `Sprite not loaded.  Did you forget to load ${texture}`
        );
      }
      const sprite = this.add.sprite(x, y, texture, frame);
      SpriteAssets[texture].anims(this, sprite);
      return sprite;
    }
  };
}
