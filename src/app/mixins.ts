import Phaser from "phaser";
import { AudioAsset, loadAudio } from "./audio";
import { ImageAsset, loadImages } from "./image";
import { SpriteAsset, SpriteAssets, loadSprites } from "./sprite";

// To get started, we need a type which we'll use to extend
// other classes from. The main responsibility is to declare
// that the type being passed in is a class.

type Constructor<T = {}> = new (...args: any[]) => T;

// This mixin adds a scale property, with getters and setters
// for changing it with an encapsulated private property:

export function withAssets<
  TBase extends Constructor<Phaser.Scene>,
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
  return class SceneWithAssets extends Base {
    preload() {
      if (assets.audio) {
        loadAudio(this, assets.audio);
      }
      if (assets.images) {
        loadImages(this, assets.images);
      }
      if (assets.sprites) {
        loadSprites(this, assets.sprites);
      }
    }

    playAudio(asset: SceneAudioAsset) {
      this.sound.play(asset);
    }

    createImage(
      x: number,
      y: number,
      texture: SceneImageAsset,
      frame?: string | number
    ): Phaser.GameObjects.Image {
      return this.add.image(x, y, texture, frame);
    }

    createSprite(
      x: number,
      y: number,
      texture: SceneSpriteAsset,
      frame?: string | number
    ): Phaser.GameObjects.Sprite {
      const sprite = this.add.sprite(x, y, texture, frame);
      SpriteAssets[texture].anims(this, sprite);
      return sprite;
    }
  };
}
