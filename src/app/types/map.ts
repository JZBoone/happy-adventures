import { Observable, Subject } from "rxjs";
import { Movable } from "../common/movable";
import { Immovable } from "../common/immovable";
import { AudioAsset } from "./audio";
import { DefaultImageAsset, ImageAsset } from "./image";
import { DefaultSpriteAsset, SpriteAsset } from "./sprite";
import { ISceneWithAssets } from "./assets";
import { Friend } from "../common/friend";
import { Interactable } from "../common/interactable";
import { Optional } from "./util";

export type Coordinates = [row: number, position: number];

export type Move = "up" | "down" | "left" | "right";

export type SceneObjectParams<Asset extends ImageAsset | SpriteAsset> = {
  asset: Asset;
  coordinates: Coordinates;
  offsetX?: number;
  offsetY?: number;
  height?: number;
  width?: number;
};

export type InteractableParams<Asset extends ImageAsset> =
  SceneObjectParams<Asset> & { message: string };

export type FriendParams<Asset extends ImageAsset | DefaultImageAsset> =
  Optional<SceneObjectParams<Asset>, "asset" | "coordinates"> & {
    dontFollow?: boolean;
  };

// Needs to be kept in sync with MapObjectsJson in map.test.ts
export type MapObjectsJson<
  SceneImageAsset extends ImageAsset,
  SceneSpriteAsset extends SpriteAsset,
  SceneImmovableImages extends Record<string, { asset: SceneImageAsset }>,
  SceneImmovableImageGroups extends Record<string, { asset: SceneImageAsset }>,
  SceneImmovableSprites extends Record<string, { asset: SceneSpriteAsset }>,
  SceneMovableImages extends Record<string, { asset: SceneImageAsset }>,
  SceneMovableSprites extends Record<string, { asset: SceneSpriteAsset }>,
> = {
  immovableImages: {
    [Property in keyof SceneImmovableImages]: SceneObjectParams<SceneImageAsset>;
  };
  immovableImageGroups: {
    [Property in keyof SceneImmovableImageGroups]: Omit<
      SceneObjectParams<SceneImageAsset>,
      "coordinates"
    > & { coordinates: Coordinates[] };
  };
  immovableSprites: {
    [Property in keyof SceneImmovableSprites]: SceneObjectParams<SceneSpriteAsset>;
  };
  movableImages: {
    [Property in keyof SceneMovableImages]: SceneObjectParams<SceneImageAsset>;
  };
  movableSprites: {
    [Property in keyof SceneMovableSprites]: SceneObjectParams<SceneSpriteAsset>;
  };
  interactables: InteractableParams<SceneImageAsset>[];
};

export interface ISceneWithMap<
  SceneAudioAsset extends AudioAsset,
  SceneImageAsset extends ImageAsset,
  SceneGroundType extends SceneImageAsset,
  SceneSpriteAsset extends SpriteAsset,
  SceneImmovableImages extends Record<string, { asset: SceneImageAsset }>,
  SceneImmovableImageGroups extends Record<string, { asset: SceneImageAsset }>,
  SceneImmovableSprites extends Record<string, { asset: SceneSpriteAsset }>,
  SceneMovableImages extends Record<string, { asset: SceneImageAsset }>,
  SceneMovableSprites extends Record<string, { asset: SceneSpriteAsset }>,
> extends ISceneWithAssets<SceneAudioAsset, SceneImageAsset, SceneSpriteAsset> {
  friend: Friend;
  moves$: Observable<{
    coordinates: Coordinates;
    move: Move;
    groundType: SceneGroundType;
  }>;
  invalidMoves$: Subject<void>;
  movesDisabled: boolean;
  map: {
    asset: ImageAsset;
    image: Phaser.GameObjects.Image;
  }[][];
  mapObjectsJson?: MapObjectsJson<
    SceneImageAsset,
    SceneSpriteAsset,
    SceneImmovableImages,
    SceneImmovableImageGroups,
    SceneImmovableSprites,
    SceneMovableImages,
    SceneMovableSprites
  >;
  groundTypes: Readonly<SceneGroundType[]>;
  mapWidth: number;
  mapHeight: number;
  immovableImages: {
    [Property in keyof SceneImmovableImages]: Immovable<Phaser.GameObjects.Image>;
  };
  immovableImageGroups: {
    [Property in keyof SceneImmovableImageGroups]: Immovable<Phaser.GameObjects.Image>[];
  };
  immovableSprites: {
    [Property in keyof SceneImmovableSprites]: Immovable<Phaser.GameObjects.Sprite>;
  };
  movableImages: {
    [Property in keyof SceneMovableImages]: Movable<Phaser.GameObjects.Image>;
  };
  movableSprites: {
    [Property in keyof SceneMovableSprites]: Movable<Phaser.GameObjects.Sprite>;
  };
  interactables: Interactable<
    SceneAudioAsset,
    SceneImageAsset,
    SceneGroundType,
    SceneSpriteAsset,
    SceneImmovableImages,
    SceneImmovableImageGroups,
    SceneImmovableSprites,
    SceneMovableImages,
    SceneMovableSprites
  >[];
  createFriend<Asset extends SceneImageAsset | DefaultImageAsset>(
    params?: SceneObjectParams<Asset> & { dontFollow?: boolean }
  ): Friend;
  createInteractable<Asset extends SceneImageAsset>(
    params: InteractableParams<Asset>
  ): Interactable<
    SceneAudioAsset,
    SceneImageAsset,
    SceneGroundType,
    SceneSpriteAsset,
    SceneImmovableImages,
    SceneImmovableImageGroups,
    SceneImmovableSprites,
    SceneMovableImages,
    SceneMovableSprites
  >;
  createImmovableSprite<Asset extends SceneSpriteAsset | DefaultSpriteAsset>(
    params: SceneObjectParams<Asset>
  ): Immovable<Phaser.GameObjects.Sprite>;
  createImmovableImage<Asset extends SceneImageAsset | DefaultImageAsset>(
    params: SceneObjectParams<Asset>
  ): Immovable<Phaser.GameObjects.Image>;
  createMovableSprite<Asset extends SceneSpriteAsset | DefaultSpriteAsset>(
    params: SceneObjectParams<Asset>
  ): Movable<Phaser.GameObjects.Sprite>;
  createMovableImage<Asset extends SceneImageAsset | DefaultImageAsset>(
    params: SceneObjectParams<Asset>
  ): Movable<Phaser.GameObjects.Image>;
  preload(): void | Promise<void>;
  create(): void | Promise<void>;
  /** map builder */
  makeMapTaller(groundType: SceneImageAsset): void;
  /** map builder */
  makeMapWider(groundType: SceneImageAsset): void;
  /** map builder */
  updateSceneObjectCoordinates(
    sceneObject:
      | Immovable<Phaser.GameObjects.Image>
      | Movable<Phaser.GameObjects.Image>,
    coordinates: Coordinates
  ): void;
  /** map builder */
  sceneObjectIsClonable(
    sceneObject:
      | Immovable<Phaser.GameObjects.Image>
      | Movable<Phaser.GameObjects.Image>
  ): boolean;
  /** map builder */
  cloneSceneObject(
    sceneObject:
      | Immovable<Phaser.GameObjects.Image>
      | Movable<Phaser.GameObjects.Image>
  ): Immovable<Phaser.GameObjects.Image> | Movable<Phaser.GameObjects.Image>;
  /** map builder */
  deleteSceneObject(
    sceneObject:
      | Immovable<Phaser.GameObjects.Image>
      | Movable<Phaser.GameObjects.Image>
  ): void;
  /** map builder */
  updateInteractableMessage(
    interactable: Interactable<
      SceneAudioAsset,
      SceneImageAsset,
      SceneGroundType,
      SceneSpriteAsset,
      SceneImmovableImages,
      SceneImmovableImageGroups,
      SceneImmovableSprites,
      SceneMovableImages,
      SceneMovableSprites
    >,
    message: string
  ): void;
}
