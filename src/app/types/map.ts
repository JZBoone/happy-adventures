import { Observable, Subject } from "rxjs";
import { Movable } from "../common/movable";
import { Immovable } from "../common/immovable";
import { AudioAsset } from "./audio";
import { DefaultImageAsset, ImageAsset } from "./image";
import { DefaultSpriteAsset, SpriteAsset } from "./sprite";
import { ISceneWithAssets } from "./assets";
import { Friend } from "../common/friend";
import { Interactable } from "../common/interactable";

export type Coordinates = [row: number, position: number];

export type Move = "up" | "down" | "left" | "right";

export interface ISceneWithMap<
  SceneAudioAsset extends AudioAsset,
  SceneImageAsset extends ImageAsset,
  SceneSpriteAsset extends SpriteAsset,
  SceneImmovableImages extends Record<string, { asset: SceneImageAsset }>,
  SceneImmovableImageGroups extends Record<string, { asset: SceneImageAsset }>,
  SceneImmovableSprites extends Record<string, { asset: SceneSpriteAsset }>,
  SceneMovableImages extends Record<string, { asset: SceneImageAsset }>,
  SceneMovableSprites extends Record<string, { asset: SceneSpriteAsset }>,
> extends ISceneWithAssets<SceneAudioAsset, SceneImageAsset, SceneSpriteAsset> {
  friend: Friend;
  moves$: Observable<{ coordinates: Coordinates; move: Move }>;
  invalidMoves$: Subject<void>;
  map: {
    asset: ImageAsset;
    image: Phaser.GameObjects.Image;
  }[][];
  mapWidth: number;
  mapHeight: number;
  immovableImages:
    | {
        [Property in keyof SceneImmovableImages]: Immovable<Phaser.GameObjects.Image>;
      }
    | Record<string, never>;
  immovableImageGroups:
    | {
        [Property in keyof SceneImmovableImageGroups]: Immovable<Phaser.GameObjects.Image>[];
      }
    | Record<string, never>;
  immovableSprites:
    | {
        [Property in keyof SceneImmovableSprites]: Immovable<Phaser.GameObjects.Sprite>;
      }
    | Record<string, never>;
  movableImages:
    | {
        [Property in keyof SceneMovableImages]: Movable<Phaser.GameObjects.Image>;
      }
    | Record<string, never>;
  movableSprites:
    | {
        [Property in keyof SceneMovableSprites]: Movable<Phaser.GameObjects.Sprite>;
      }
    | Record<string, never>;
  createFriend<Asset extends SceneImageAsset | DefaultImageAsset>(params?: {
    asset?: Asset;
    coordinates: Coordinates;
    offsetX?: number;
    offsetY?: number;
    height?: number;
    width?: number;
  }): Friend;
  createInteractable<Asset extends SceneImageAsset>(params: {
    asset: Asset;
    coordinates: Coordinates;
    offsetX?: number;
    offsetY?: number;
    height?: number;
    width?: number;
    message: string;
  }): Interactable<SceneAudioAsset, SceneImageAsset, SceneSpriteAsset>;
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
  preload(): void | Promise<void>;
  create(): void | Promise<void>;
  /** for map builder */
  makeMapTaller(groundType: SceneImageAsset): void;
  /** for map builder */
  makeMapWider(groundType: SceneImageAsset): void;
}
