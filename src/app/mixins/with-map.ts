import Phaser from "phaser";
import { Subject, debounceTime, filter, map, share } from "rxjs";
import {
  createMapImage,
  fetchMap,
  loadMap,
  mapEditorSceneKey,
  mapTileSizePx,
  moveCoordinates,
} from "../common/map";
import { Movable } from "../common/movable";
import { Immovable } from "../common/immovable";
import { Coordinates, ISceneWithMap, Move } from "../types/map";
import { AudioAsset } from "../types/audio";
import { DefaultImageAsset, ImageAsset } from "../types/image";
import { DefaultSpriteAsset, SpriteAsset } from "../types/sprite";
import { ISceneWithAssets } from "../types/assets";
import { Constructor } from "../types/util";
import { Friend } from "../common/friend";
import { Interactable } from "../common/interactable";
import { Level } from "../types/level";

export function withMap<
  SceneAudioAsset extends AudioAsset,
  SceneImageAsset extends ImageAsset,
  SceneSpriteAsset extends SpriteAsset,
  SceneImmovableImages extends Record<string, { asset: SceneImageAsset }>,
  SceneImmovableImageGroups extends Record<string, { asset: SceneImageAsset }>,
  SceneImmovableSprites extends Record<string, { asset: SceneSpriteAsset }>,
  SceneMovableImages extends Record<string, { asset: SceneImageAsset }>,
  SceneMovableSprites extends Record<string, { asset: SceneSpriteAsset }>,
>(
  Base: Constructor<
    ISceneWithAssets<SceneAudioAsset, SceneImageAsset, SceneSpriteAsset>
  >,
  options: {
    map: ImageAsset[][] | string;
    immovableImages?: SceneImmovableImages;
    immovableImageGroups?: SceneImmovableImageGroups;
    immovableSprites?: SceneImmovableSprites;
    movableImages?: SceneMovableImages;
    movableSprites?: SceneMovableSprites;
  }
) {
  return class SceneWithMap
    extends Base
    implements
      ISceneWithMap<SceneAudioAsset, SceneImageAsset, SceneSpriteAsset>
  {
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    friend!: Friend;
    map: {
      asset: ImageAsset;
      image: Phaser.GameObjects.Image;
    }[][] = [];
    mapWidth!: number;
    mapHeight!: number;
    pendingMapJson!: Promise<{
      mapJson: ImageAsset[][] | null;
      mapObjectsJson: {
        immovableImageGroups: {
          [Property in keyof SceneImmovableImageGroups]: {
            asset: SceneImageAsset;
            coordinates: Coordinates[];
            offsetY?: number;
            width?: number;
            height?: number;
          };
        };
        immovableImages: {
          [Property in keyof SceneImmovableImages]: {
            asset: SceneImageAsset;
            coordinates: Coordinates;
            offsetY?: number;
            width?: number;
            height?: number;
          };
        };
        immovableSprites: {
          [Property in keyof SceneImmovableSprites]: {
            asset: SceneSpriteAsset;
            coordinates: Coordinates;
            offsetY?: number;
            width?: number;
            height?: number;
          };
        };
        movableImages: {
          [Property in keyof SceneMovableImages]: {
            asset: SceneImageAsset;
            coordinates: Coordinates;
            offsetY?: number;
            width?: number;
            height?: number;
          };
        };
        movableSprites: {
          [Property in keyof SceneMovableSprites]: {
            asset: SceneSpriteAsset;
            coordinates: Coordinates;
            offsetY?: number;
            width?: number;
            height?: number;
          };
        };
        interactables: {
          asset: SceneImageAsset;
          coordinates: Coordinates;
          offsetY?: number;
          width?: number;
          height?: number;
        }[];
      } | null;
    } | null>;
    private mapJson: ImageAsset[][] = [];
    private mapObjectsJson?: {
      immovableImages: {
        [Property in keyof SceneImmovableImages]: {
          asset: SceneImageAsset;
          coordinates: Coordinates;
          offsetY?: number;
          width?: number;
          height?: number;
        };
      };
      immovableImageGroups: {
        [Property in keyof SceneImmovableImageGroups]: {
          asset: SceneImageAsset;
          coordinates: Coordinates[];
          offsetY?: number;
          width?: number;
          height?: number;
        };
      };
      immovableSprites: {
        [Property in keyof SceneImmovableSprites]: {
          asset: SceneSpriteAsset;
          coordinates: Coordinates;
          offsetY?: number;
          width?: number;
          height?: number;
        };
      };
      movableImages: {
        [Property in keyof SceneMovableImages]: {
          asset: SceneImageAsset;
          coordinates: Coordinates;
          offsetY?: number;
          width?: number;
          height?: number;
        };
      };
      movableSprites: {
        [Property in keyof SceneMovableSprites]: {
          asset: SceneSpriteAsset;
          coordinates: Coordinates;
          offsetY?: number;
          width?: number;
          height?: number;
        };
      };
      interactables: {
        asset: SceneImageAsset;
        coordinates: Coordinates;
        message: string;
        offsetY?: number;
        width?: number;
        height?: number;
      }[];
    } | null;
    // @ts-expect-error Type '{}' is not assignable to type '{ [Property in keyof SceneImmovableSprites]: Immovable<Sprite>; }'.ts(2322)
    immovableImages: {
      [Property in keyof SceneImmovableImages]: Immovable<Phaser.GameObjects.Image>;
    } = {};
    // @ts-expect-error Type '{}' is not assignable to type '{ [Property in keyof SceneImmovableSprites]: Immovable<Sprite>; }'.ts(2322)
    immovableImageGroups: {
      [Property in keyof SceneImmovableImageGroups]: Immovable<Phaser.GameObjects.Image>[];
    } = {};
    // @ts-expect-error Type '{}' is not assignable to type '{ [Property in keyof SceneImmovableSprites]: Immovable<Sprite>; }'.ts(2322)
    immovableSprites: {
      [Property in keyof SceneImmovableSprites]: Immovable<Phaser.GameObjects.Sprite>;
    } = {};
    // @ts-expect-error Type '{}' is not assignable to type '{ [Property in keyof SceneImmovableSprites]: Immovable<Sprite>; }'.ts(2322)
    movableImages: {
      [Property in keyof SceneMovableImages]: Movable<Phaser.GameObjects.Image>;
    } = {};
    // @ts-expect-error Type '{}' is not assignable to type '{ [Property in keyof SceneImmovableSprites]: Immovable<Sprite>; }'.ts(2322)
    movableSprites: {
      [Property in keyof SceneMovableSprites]: Movable<Phaser.GameObjects.Sprite>;
    } = {};
    private _moves$ = new Subject<Move>();
    private allMoveCoordinates$ = this._moves$.asObservable().pipe(
      map((move) => ({
        move,
        coordinates: moveCoordinates(move, this.friend.coordinates()),
      })),
      share()
    );
    moves$ = this.allMoveCoordinates$.pipe(
      filter(({ coordinates }) => !this.moveIsIllegal(...coordinates))
    );
    invalidMoves$ = new Subject<void>();

    private movables: Movable<
      Phaser.GameObjects.Image | Phaser.GameObjects.Sprite
    >[] = [];

    private interactables: Interactable<
      SceneAudioAsset,
      SceneImageAsset,
      SceneSpriteAsset
    >[] = [];

    private hotkey!: {
      e: Phaser.Input.Keyboard.Key;
    };

    async preload() {
      super.preload();
      if (typeof options.map === "string") {
        const pendingMapJson = fetchMap<
          SceneSpriteAsset,
          SceneImageAsset,
          SceneImmovableImages,
          SceneImmovableImageGroups,
          SceneImmovableSprites,
          SceneMovableImages,
          SceneMovableSprites
        >(options.map);
        this.pendingMapJson = pendingMapJson;
        const { mapJson, mapObjectsJson } = await pendingMapJson;
        if (!mapJson) {
          throw new Error("mapJson not loaded");
        }
        this.mapJson = mapJson;
        if (!mapObjectsJson) {
          console.warn("mapObjectsJson not loaded");
        } else {
          this.mapObjectsJson = mapObjectsJson;
        }
      } else {
        this.mapJson = options.map;
        this.pendingMapJson = Promise.resolve(null);
      }
      this.setMapDimensions();
    }

    async create() {
      await this.pendingMapJson;
      this.map = loadMap(this, this.mapJson);
      if (this.mapObjectsJson?.immovableSprites) {
        for (const [key, _options] of Object.entries(
          this.mapObjectsJson.immovableSprites
        )) {
          this.immovableSprites[key as keyof SceneImmovableSprites] =
            this.createImmovableSprite(_options);
        }
      }
      if (this.mapObjectsJson?.movableImages) {
        for (const [key, _options] of Object.entries(
          this.mapObjectsJson.movableImages
        )) {
          this.movableImages[key as keyof SceneMovableImages] =
            this.createMovableImage(_options);
        }
      }
      if (this.mapObjectsJson?.movableSprites) {
        for (const [key, _options] of Object.entries(
          this.mapObjectsJson.movableSprites
        )) {
          this.movableSprites[key as keyof SceneMovableSprites] =
            this.createMovableSprite(_options);
        }
      }
      if (this.mapObjectsJson?.immovableImages) {
        for (const [key, _options] of Object.entries(
          this.mapObjectsJson.immovableImages
        )) {
          this.immovableImages[key as keyof SceneImmovableImages] =
            this.createMovableImage(_options);
        }
      }
      if (this.mapObjectsJson?.immovableImageGroups) {
        for (const [key, _options] of Object.entries(
          this.mapObjectsJson.immovableImageGroups
        )) {
          this.immovableImageGroups[key as keyof SceneImmovableImageGroups] =
            _options.coordinates.map((coordinates) =>
              this.createImmovableImage({ ..._options, coordinates })
            );
        }
      }
      if (this.mapObjectsJson?.interactables) {
        this.interactables = this.mapObjectsJson.interactables.map((_options) =>
          this.createInteractable(_options)
        );
      }
      this.cursors = this.input.keyboard!.createCursorKeys();
      this.allMoveCoordinates$
        .pipe(filter(({ coordinates }) => this.moveIsIllegal(...coordinates)))
        .subscribe(() => {
          this.invalidMoves$.next();
        });
      this.invalidMoves$.pipe(debounceTime(25)).subscribe(() => {
        this.playSound(AudioAsset.Thump);
      });
      this.hotkey = {
        e: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      };
    }

    update() {
      if (
        process.env.MAP_BUILDER_ENABLED &&
        typeof options.map === "string" &&
        Phaser.Input.Keyboard.JustDown(this.hotkey.e)
      ) {
        this.scene.start(mapEditorSceneKey(options.map as Level));
        return;
      }
      const move = this.getMove();
      if (!move) {
        return;
      }
      this._moves$.next(move);
    }

    createImmovableSprite<
      Asset extends SceneSpriteAsset | DefaultSpriteAsset,
    >(params: {
      asset: Asset;
      coordinates: Coordinates;
      offsetX?: number;
      offsetY?: number;
      height?: number;
      width?: number;
    }): Immovable<Phaser.GameObjects.Sprite> {
      const { asset, coordinates, offsetX, offsetY, height, width } = params;
      if (!this.sprites.includes(asset)) {
        throw new Error(
          `Immovable sprite not loaded. Did you forget to load ${asset}?`
        );
      }
      const sprite = this.createSprite({
        coordinates,
        offsetX,
        offsetY,
        asset,
        width,
        height,
      });
      return new Immovable(sprite, {
        offsetX,
        offsetY,
        width,
        height,
      });
    }

    createImmovableImage<
      Asset extends SceneImageAsset | DefaultImageAsset,
    >(params: {
      asset: Asset;
      coordinates: Coordinates;
      offsetX?: number;
      offsetY?: number;
      height?: number;
      width?: number;
    }): Immovable<Phaser.GameObjects.Image> {
      const { asset, coordinates, offsetX, offsetY, height, width } = params;
      if (!this.images.includes(asset)) {
        throw new Error(
          `Immovable image not loaded. Did you forget to load ${asset}?`
        );
      }
      const image = this.createImage({
        coordinates,
        offsetX,
        offsetY,
        asset,
        width,
        height,
      });
      return new Immovable(image, {
        offsetX,
        offsetY,
        width,
        height,
      });
    }

    createFriend<Asset extends SceneImageAsset | DefaultImageAsset>(
      params: {
        asset?: Asset;
        coordinates?: Coordinates;
        offsetX?: number;
        offsetY?: number;
        width?: number;
        height?: number;
      } = {}
    ): Friend {
      const { asset, coordinates, offsetX, offsetY, width, height } = params;
      const assetOrDefault = ImageAsset.Friend || asset;
      if (!this.images.includes(assetOrDefault)) {
        throw new Error(
          `Friend image not loaded. Did you forget to load ${assetOrDefault}?`
        );
      }
      const image = this.createImage({
        coordinates: coordinates || [0, 0],
        offsetX,
        offsetY,
        asset: assetOrDefault,
        width,
        height,
      });
      const friend = new Friend(this, image, {
        offsetX,
        offsetY,
        width,
        height,
        mapWidth: this.mapWidth,
        mapHeight: this.mapHeight,
      });
      this.movables.push(friend);
      this.friend = friend;
      return this.friend;
    }

    createInteractable<Asset extends SceneImageAsset>(params: {
      asset: Asset;
      coordinates: Coordinates;
      offsetX?: number;
      offsetY?: number;
      width?: number;
      height?: number;
      message: string;
    }): Interactable<SceneAudioAsset, SceneImageAsset, SceneSpriteAsset> {
      const { asset, coordinates, offsetX, offsetY, width, height, message } =
        params;
      if (!this.images.includes(asset)) {
        throw new Error(
          `Interactable image not loaded. Did you forget to load ${asset}?`
        );
      }
      const image = this.createImage({
        coordinates: coordinates,
        offsetX,
        offsetY,
        asset,
        width,
        height,
      });
      const interactable = new Interactable(this, image, {
        offsetX,
        offsetY,
        width,
        height,
        message,
      });
      this.interactables.push(interactable);
      return interactable;
    }

    createMovableSprite<
      Asset extends SceneSpriteAsset | DefaultSpriteAsset,
    >(params: {
      asset: Asset;
      coordinates: Coordinates;
      offsetX?: number;
      offsetY?: number;
      width?: number;
      height?: number;
    }): Movable<Phaser.GameObjects.Sprite> {
      const { asset, coordinates, offsetX, offsetY, width, height } = params;
      if (!this.sprites.includes(asset)) {
        throw new Error(
          `Movable sprite not loaded. Did you forget to load ${asset}?`
        );
      }
      const sprite = this.createSprite({
        coordinates,
        offsetX,
        offsetY,
        asset,
        width,
        height,
      });
      const movable: Movable<Phaser.GameObjects.Sprite> = new Movable(
        this,
        sprite,
        { offsetX, offsetY, width, height }
      );
      this.movables.push(movable);
      return movable;
    }

    createMovableImage<
      Asset extends SceneImageAsset | DefaultImageAsset,
    >(params: {
      asset: Asset;
      coordinates: Coordinates;
      offsetX?: number;
      offsetY?: number;
      width?: number;
      height?: number;
    }): Movable<Phaser.GameObjects.Image> {
      const { asset, coordinates, offsetX, offsetY, width, height } = params;
      if (!this.images.includes(asset)) {
        throw new Error(
          `Movable image not loaded. Did you forget to load ${asset}?`
        );
      }
      const image = this.createImage({
        coordinates,
        offsetX,
        offsetY,
        asset,
        width,
        height,
      });
      const movable: Movable<Phaser.GameObjects.Image> = new Movable(
        this,
        image,
        { offsetX, offsetY, width, height }
      );
      this.movables.push(movable);
      return movable;
    }

    makeMapTaller(groundType: SceneImageAsset) {
      const newRow: SceneImageAsset[] = [];
      for (let i = 0; i < this.mapJson[0].length; i++) {
        newRow.push(groundType);
      }
      this.mapJson.push(newRow);
      this.map.push(
        newRow.map((asset, positionIndex) => ({
          asset,
          image: createMapImage(this, {
            asset,
            coordinates: [this.map.length, positionIndex],
          }),
        }))
      );
      this.setMapDimensions();
    }

    makeMapWider(groundType: SceneImageAsset) {
      const positionIndex = this.map[0].length;
      for (let i = 0; i < this.mapJson.length; i++) {
        this.mapJson[i].push(groundType);
        this.map[i].push({
          asset: groundType,
          image: createMapImage(this, {
            asset: groundType,
            coordinates: [i, positionIndex],
          }),
        });
      }
      this.setMapDimensions();
    }

    private moveIsIllegal(newRow: number, newPosition: number): boolean {
      return (
        newRow < 0 ||
        newRow > this.map.length - 1 ||
        newPosition < 0 ||
        newPosition > this.map[0].length - 1 ||
        this.interactables.some((interactable) =>
          interactable.isAt([newRow, newPosition])
        )
      );
    }

    private getMove(): Move | null {
      for (const movable of this.movables) {
        if (movable.isMoving()) {
          return null;
        }
      }
      if (this.cursors.up.isDown) {
        return "up";
      } else if (this.cursors.down.isDown) {
        return "down";
      } else if (this.cursors.right.isDown) {
        return "right";
      } else if (this.cursors.left.isDown) {
        return "left";
      }
      return null;
    }

    /**
     * Updates `this.mapHeight` and `this.mapWidth`. Should be called
     * after changing `this.mapJson`
     */
    setMapDimensions() {
      this.mapHeight = this.mapJson.length * mapTileSizePx;
      this.mapWidth = this.mapJson[0].length * mapTileSizePx;
    }
  };
}
