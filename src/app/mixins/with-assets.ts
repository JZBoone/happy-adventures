import Phaser from "phaser";
import { AudioAsset, loadAudio } from "../common/audio";
import { ImageAsset, loadImages } from "../common/image";
import { SpriteAsset, SpriteAssets, loadSprites } from "../common/sprite";
import { SceneClass } from "./types";
import { worldPosition } from "../common/map";

export const defaultAudio = [AudioAsset.Thump] as const;
export type DefaultAudioAsset = (typeof defaultAudio)[number];
export const defaultImages = [ImageAsset.Friend] as const;
export type DefaultImageAsset = (typeof defaultImages)[number];

export interface ISceneWithAssets<
  SceneAudioAsset extends AudioAsset,
  SceneImageAsset extends ImageAsset,
  SceneSpriteAsset extends SpriteAsset,
> extends Phaser.Scene {
  audio: readonly (SceneAudioAsset | DefaultAudioAsset)[];
  images: readonly (SceneImageAsset | DefaultImageAsset)[];
  sprites: readonly SceneSpriteAsset[];
  createImage(params: {
    row: number;
    position: number;
    offsetX?: number;
    offsetY?: number;
    height?: number;
    width?: number;
    asset: SceneImageAsset | DefaultImageAsset;
    frame?: string | number;
  }): Phaser.GameObjects.Image;
  createSprite(params: {
    row: number;
    position: number;
    offsetX?: number;
    offsetY?: number;
    height?: number;
    width?: number;
    asset: SceneSpriteAsset;
    frame?: string | number;
  }): Phaser.GameObjects.Sprite;
  playAudio(asset: SceneAudioAsset | DefaultAudioAsset): void;
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
    audio = [...(assets.audio || []), ...defaultAudio];
    images = [...(assets.images || []), ...defaultImages];
    sprites = assets?.sprites || [];

    preload() {
      loadAudio(this, this.audio);
      loadImages(this, this.images);
      if (assets.sprites) {
        loadSprites(this, assets.sprites);
      }
    }

    create() {}

    playAudio(asset: SceneAudioAsset | DefaultAudioAsset) {
      if (!this.audio.includes(asset)) {
        throw new Error(`Audio not loaded. Did you forget to load ${asset}?`);
      }
      this.sound.play(asset);
    }

    createImage(params: {
      row: number;
      position: number;
      offsetX?: number;
      offsetY?: number;
      height?: number;
      width?: number;
      asset: SceneImageAsset | DefaultImageAsset;
      frame?: string | number;
    }): Phaser.GameObjects.Image {
      const { row, position, offsetX, offsetY, asset, frame, width, height } =
        params;
      const [x, y] = worldPosition({
        row,
        position,
        offsetX,
        offsetY,
        width,
        height,
      });
      if (!this.images.includes(asset)) {
        throw new Error(`Image not loaded. Did you forget to load ${asset}?`);
      }
      return this.add.image(x, y, asset, frame);
    }

    createSprite(params: {
      row: number;
      position: number;
      offsetX?: number;
      offsetY?: number;
      height?: number;
      width?: number;
      asset: SceneSpriteAsset;
      frame?: string | number;
    }): Phaser.GameObjects.Sprite {
      const { row, position, offsetX, offsetY, asset, frame, width, height } =
        params;
      const [x, y] = worldPosition({
        row,
        position,
        offsetX,
        offsetY,
        width,
        height,
      });
      if (!this.sprites.includes(asset)) {
        throw new Error(`Sprite not loaded.  Did you forget to load ${asset}`);
      }
      const sprite = this.add.sprite(x, y, asset, frame);
      SpriteAssets[asset].anims(this, sprite);
      return sprite;
    }
  };
}
