import { AudioAsset, DefaultAudioAsset } from "./audio";
import { DefaultImageAsset, ImageAsset } from "./image";
import { Coordinates } from "./map";
import { DefaultSpriteAsset, SpriteAsset } from "./sprite";

export interface ISceneWithAssets<
  SceneAudioAsset extends AudioAsset,
  SceneImageAsset extends ImageAsset,
  SceneSpriteAsset extends SpriteAsset,
> extends Phaser.Scene {
  audio: readonly (SceneAudioAsset | DefaultAudioAsset)[];
  images: readonly (SceneImageAsset | DefaultImageAsset)[];
  sprites: readonly (SceneSpriteAsset | DefaultSpriteAsset)[];
  createImage(params: {
    coordinates: Coordinates;
    offsetX?: number;
    offsetY?: number;
    height?: number;
    width?: number;
    asset: SceneImageAsset | DefaultImageAsset;
    frame?: string | number;
  }): Phaser.GameObjects.Image;
  createSprite(params: {
    coordinates: Coordinates;
    offsetX?: number;
    offsetY?: number;
    height?: number;
    width?: number;
    asset: SceneSpriteAsset | DefaultSpriteAsset;
    frame?: string | number;
  }): Phaser.GameObjects.Sprite;
  playSound(
    asset: SceneAudioAsset | DefaultAudioAsset,
    extra?: Phaser.Types.Sound.SoundConfig | Phaser.Types.Sound.SoundMarker
  ): boolean;
  addSound(
    asset: SceneAudioAsset | DefaultAudioAsset,
    config?: Phaser.Types.Sound.SoundConfig
  ):
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;
  preload(): void | Promise<void>;
  create(): void | Promise<void>;
}
