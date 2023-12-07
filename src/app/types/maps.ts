import { Observable, Subject } from "rxjs";
import { Friend, Movable } from "../common/movable";
import { Immovable } from "../common/immovable";
import { AudioAsset } from "./audio";
import { DefaultImageAsset, ImageAsset } from "./image";
import { DefaultSpriteAsset, SpriteAsset } from "./sprite";
import { ISceneWithAssets } from "./assets";

export type Coordinates = [row: number, position: number];

export type Move = "up" | "down" | "left" | "right";

export interface ISceneWithMap<
  SceneAudioAsset extends AudioAsset,
  SceneImageAsset extends ImageAsset,
  SceneSpriteAsset extends SpriteAsset,
> extends ISceneWithAssets<SceneAudioAsset, SceneImageAsset, SceneSpriteAsset> {
  friend: Friend;
  moves$: Observable<{ coordinates: Coordinates; move: Move }>;
  invalidMoves$: Subject<void>;
  createFriend<Asset extends SceneImageAsset | DefaultImageAsset>(params?: {
    asset?: Asset;
    coordinates: Coordinates;
    offsetX?: number;
    offsetY?: number;
    height?: number;
    width?: number;
  }): Friend;
  createImmovableSprite<
    Asset extends SceneSpriteAsset | DefaultSpriteAsset,
  >(params: {
    asset: Asset;
    coordinates: Coordinates;
    offsetX?: number;
    offsetY?: number;
    height?: number;
    width?: number;
  }): Immovable<Phaser.GameObjects.Sprite>;
  createImmovableImage<
    Asset extends SceneImageAsset | DefaultImageAsset,
  >(params: {
    asset: Asset;
    coordinates: Coordinates;
    offsetX?: number;
    offsetY?: number;
    height?: number;
    width?: number;
  }): Immovable<Phaser.GameObjects.Image>;
  createMovableSprite<
    Asset extends SceneSpriteAsset | DefaultSpriteAsset,
  >(params: {
    asset: Asset;
    coordinates: Coordinates;
    offsetX?: number;
    offsetY?: number;
    height?: number;
    width?: number;
  }): Movable<Phaser.GameObjects.Sprite>;
  createMovableImage<
    Asset extends SceneImageAsset | DefaultImageAsset,
  >(params: {
    asset: Asset;
    coordinates: Coordinates;
    offsetX?: number;
    offsetY?: number;
    height?: number;
    width?: number;
  }): Movable<Phaser.GameObjects.Image>;
}
