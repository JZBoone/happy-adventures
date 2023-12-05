import Phaser from "phaser";
import { AudioAsset, loadAudio } from "../common/audio";
import { ImageAsset, loadImages } from "../common/image";
import { SpriteAsset, SpriteAssets, loadSprites } from "../common/sprite";
import { SceneClass } from "./common";

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
  return class SceneWithAssets extends Base {
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
