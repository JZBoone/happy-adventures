import Phaser from "phaser";
import { worldPosition } from "../common/map";
import { AudioAsset, DefaultAudioAsset, defaultAudio } from "../types/audio";
import { DefaultImageAsset, ImageAsset, defaultImages } from "../types/image";
import { SpriteAsset, SpriteAssets, defaultSprites } from "../types/sprite";
import { ISceneWithAssets } from "../types/assets";
import { loadAudio, loadImages, loadSprites } from "../common/assets";
import { Coordinates } from "../types/map";
import { Constructor } from "../types/util";

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
  return class SceneWithAssets
    extends Base
    implements
      ISceneWithAssets<SceneAudioAsset, SceneImageAsset, SceneSpriteAsset>
  {
    audio = [...(assets.audio || []), ...defaultAudio];
    images = [...(assets.images || []), ...defaultImages];
    sprites = [...(assets.sprites || []), ...defaultSprites];

    preload() {
      loadAudio(this, this.audio);
      loadImages(this, this.images);
      loadSprites(this, this.sprites);
    }

    create() {}

    playSound(
      asset: SceneAudioAsset | DefaultAudioAsset,
      extra?: Phaser.Types.Sound.SoundConfig | Phaser.Types.Sound.SoundMarker
    ): boolean {
      if (!this.audio.includes(asset)) {
        throw new Error(`Audio not loaded. Did you forget to load ${asset}?`);
      }
      return this.sound.play(asset, extra);
    }

    addSound(
      asset: SceneAudioAsset | DefaultAudioAsset,
      config?: Phaser.Types.Sound.SoundConfig
    ):
      | Phaser.Sound.NoAudioSound
      | Phaser.Sound.HTML5AudioSound
      | Phaser.Sound.WebAudioSound {
      if (!this.audio.includes(asset)) {
        throw new Error(`Audio not loaded. Did you forget to load ${asset}?`);
      }
      return this.sound.add(asset, config);
    }

    createImage(params: {
      coordinates: Coordinates;
      offsetX?: number;
      offsetY?: number;
      height?: number;
      width?: number;
      asset: SceneImageAsset | DefaultImageAsset;
      frame?: string | number;
    }): Phaser.GameObjects.Image {
      const { coordinates, offsetX, offsetY, asset, frame, width, height } =
        params;
      const [x, y] = worldPosition({
        coordinates,
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
      coordinates: Coordinates;
      offsetX?: number;
      offsetY?: number;
      height?: number;
      width?: number;
      asset: SceneSpriteAsset;
      frame?: string | number;
    }): Phaser.GameObjects.Sprite {
      const { coordinates, offsetX, offsetY, asset, frame, width, height } =
        params;
      const [x, y] = worldPosition({
        coordinates,
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
