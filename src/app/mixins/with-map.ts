import Phaser from "phaser";
import { Subject, debounceTime, filter, map, share } from "rxjs";
import { set } from "lodash";
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
import {
  Coordinates,
  FriendParams,
  ISceneWithMap,
  InteractableParams,
  MapObjectsJson,
  Move,
  SceneObjectParams,
} from "../types/map";
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
    level: Level;
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
      ISceneWithMap<
        SceneAudioAsset,
        SceneImageAsset,
        SceneSpriteAsset,
        SceneImmovableImages,
        SceneImmovableImageGroups,
        SceneImmovableSprites,
        SceneMovableImages,
        SceneMovableSprites
      >
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
      mapObjectsJson: MapObjectsJson<
        SceneImageAsset,
        SceneSpriteAsset,
        SceneImmovableImages,
        SceneImmovableImageGroups,
        SceneImmovableSprites,
        SceneMovableImages,
        SceneMovableSprites
      > | null;
    }>;
    private mapJson: ImageAsset[][] = [];
    mapObjectsJson?: MapObjectsJson<
      SceneImageAsset,
      SceneSpriteAsset,
      SceneImmovableImages,
      SceneImmovableImageGroups,
      SceneImmovableSprites,
      SceneMovableImages,
      SceneMovableSprites
    >;
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
    private sceneObjectConfigPath = new Map<
      Immovable<Phaser.GameObjects.Image> | Movable<Phaser.GameObjects.Image>,
      string
    >();
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

    interactables: Interactable<
      SceneAudioAsset,
      SceneImageAsset,
      SceneSpriteAsset,
      SceneImmovableImages,
      SceneImmovableImageGroups,
      SceneImmovableSprites,
      SceneMovableImages,
      SceneMovableSprites
    >[] = [];

    private hotkey!: {
      e: Phaser.Input.Keyboard.Key;
    };

    async preload() {
      super.preload();
      const pendingMapJson = fetchMap<
        SceneSpriteAsset,
        SceneImageAsset,
        SceneImmovableImages,
        SceneImmovableImageGroups,
        SceneImmovableSprites,
        SceneMovableImages,
        SceneMovableSprites
      >(options.level);
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
      this.setMapDimensions();
    }

    updateSceneObjectCoordinates(
      sceneObject:
        | Immovable<Phaser.GameObjects.Image>
        | Movable<Phaser.GameObjects.Image>,
      coordinates: Coordinates
    ) {
      const path = this.sceneObjectConfigPath.get(sceneObject)!;
      set(this.mapObjectsJson!, `${path}`, coordinates);
    }

    sceneObjectIsClonable(
      sceneObject:
        | Immovable<Phaser.GameObjects.Image>
        | Movable<Phaser.GameObjects.Image>
    ): boolean {
      const path = this.sceneObjectConfigPath.get(sceneObject)!;
      return (
        path.startsWith("interactables") ||
        path.startsWith("immovableImageGroups")
      );
    }

    cloneSceneObject(
      sceneObject:
        | Immovable<Phaser.GameObjects.Image>
        | Movable<Phaser.GameObjects.Image>
    ): Immovable<Phaser.GameObjects.Image> | Movable<Phaser.GameObjects.Image> {
      if (!this.sceneObjectIsClonable(sceneObject)) {
        throw new Error(
          "Cannot clone scene object because it is not clonable!"
        );
      }
      const path = this.sceneObjectConfigPath.get(sceneObject)!;
      if (path.startsWith("interactables")) {
        const [, i] = path.split(".");
        const config = {
          ...this.mapObjectsJson!.interactables[+i],
        } as InteractableParams<SceneImageAsset>;
        const interactable = this.createInteractable(config);
        this.interactables.push(interactable);
        this.mapObjectsJson!.interactables.push(config);
        this.sceneObjectConfigPath.set(
          interactable,
          `interactables.${
            this.mapObjectsJson!.interactables.length - 1
          }.coordinates`
        );
        return interactable;
      }
      if (path.startsWith("immovableImageGroups")) {
        // create immovable image
        const [, key, , i] = path.split(".");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { coordinates, ...config } =
          this.mapObjectsJson!.immovableImageGroups[key];
        const cloneCoordinates =
          this.mapObjectsJson!.immovableImageGroups[key].coordinates[+i];
        const immovableImage = this.createImmovableImage({
          ...config,
          coordinates: cloneCoordinates,
        });
        this.sceneObjectConfigPath.set(
          immovableImage,
          `immovableImageGroups.${key}.coordinates.${+i + 1}`
        );
        this.mapObjectsJson!.immovableImageGroups[key].coordinates.push(
          cloneCoordinates
        );
        this.immovableImageGroups[key].push(immovableImage);
        return immovableImage;
      }
      throw new Error("This should never happen");
    }

    deleteSceneObject(
      sceneObject:
        | Immovable<Phaser.GameObjects.Image>
        | Movable<Phaser.GameObjects.Image>
    ): void {
      if (!this.sceneObjectIsClonable(sceneObject)) {
        throw new Error(
          "Cannot delete scene object because it is not clonable!"
        );
      }
      const path = this.sceneObjectConfigPath.get(sceneObject)!;
      if (path.startsWith("interactables")) {
        const [, i] = path.split(".");
        this.interactables.splice(+i, 1);
        this.mapObjectsJson!.interactables.splice(+i, 1);
      }
      if (path.startsWith("immovableImageGroups")) {
        const [, key, , i] = path.split(".");
        this.immovableImageGroups[key].splice(+i, 1);
        this.mapObjectsJson!.immovableImageGroups[key].coordinates.splice(
          +i,
          1
        );
      }
      this.sceneObjectConfigPath.delete(sceneObject);
      sceneObject.phaserObject.destroy();
    }

    async create() {
      await this.pendingMapJson;
      this.map = loadMap(this, this.mapJson);
      if (this.mapObjectsJson?.immovableSprites) {
        for (const [key, _options] of Object.entries(
          this.mapObjectsJson.immovableSprites
        )) {
          const immovableSprite = this.createImmovableSprite(_options);
          this.immovableSprites[key as keyof SceneImmovableSprites] =
            immovableSprite;
          this.sceneObjectConfigPath.set(
            immovableSprite,
            `immovableSprites.${key}.coordinates`
          );
        }
      }
      if (this.mapObjectsJson?.movableImages) {
        for (const [key, _options] of Object.entries(
          this.mapObjectsJson.movableImages
        )) {
          const movableImage = this.createMovableImage(_options);
          this.movableImages[key as keyof SceneMovableImages] = movableImage;
          this.sceneObjectConfigPath.set(
            movableImage,
            `movableImages.${key}.coordinates`
          );
        }
      }
      if (this.mapObjectsJson?.movableSprites) {
        for (const [key, _options] of Object.entries(
          this.mapObjectsJson.movableSprites
        )) {
          const movableSprite = this.createMovableSprite(_options);
          this.movableSprites[key as keyof SceneMovableSprites] = movableSprite;
          this.sceneObjectConfigPath.set(
            movableSprite,
            `movableSprites.${key}.coordinates`
          );
        }
      }
      if (this.mapObjectsJson?.immovableImages) {
        for (const [key, _options] of Object.entries(
          this.mapObjectsJson.immovableImages
        )) {
          const immovableImage = this.createMovableImage(_options);
          this.immovableImages[key as keyof SceneImmovableImages] =
            immovableImage;
          this.sceneObjectConfigPath.set(
            immovableImage,
            `immovableImages.${key}.coordinates`
          );
        }
      }
      if (this.mapObjectsJson?.immovableImageGroups) {
        for (const [key, _options] of Object.entries(
          this.mapObjectsJson.immovableImageGroups
        )) {
          this.immovableImageGroups[key as keyof SceneImmovableImageGroups] =
            _options.coordinates.map((coordinates, i) => {
              const immovableImage = this.createImmovableImage({
                ..._options,
                coordinates,
              });
              this.sceneObjectConfigPath.set(
                immovableImage,
                `immovableImageGroups.${key}.coordinates.${i}`
              );
              return immovableImage;
            });
        }
      }
      if (this.mapObjectsJson?.interactables) {
        this.interactables = this.mapObjectsJson.interactables.map(
          (_options, i) => {
            const interactable = this.createInteractable(_options);
            this.sceneObjectConfigPath.set(
              interactable,
              `interactables.${i}.coordinates`
            );
            return interactable;
          }
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
        Phaser.Input.Keyboard.JustDown(this.hotkey.e)
      ) {
        this.scene.start(mapEditorSceneKey(options.level));
        return;
      }
      const move = this.getMove();
      if (!move) {
        return;
      }
      this._moves$.next(move);
    }

    createImmovableSprite<Asset extends SceneSpriteAsset | DefaultSpriteAsset>(
      params: SceneObjectParams<Asset>
    ): Immovable<Phaser.GameObjects.Sprite> {
      if (!this.sprites.includes(params.asset)) {
        throw new Error(
          `Immovable sprite not loaded. Did you forget to load ${params.asset}?`
        );
      }
      const sprite = this.createSprite(params);
      return new Immovable(sprite, params);
    }

    createImmovableImage<Asset extends SceneImageAsset | DefaultImageAsset>(
      params: SceneObjectParams<Asset>
    ): Immovable<Phaser.GameObjects.Image> {
      if (!this.images.includes(params.asset)) {
        throw new Error(
          `Immovable image not loaded. Did you forget to load ${params.asset}?`
        );
      }
      const image = this.createImage(params);
      return new Immovable(image, params);
    }

    createFriend<Asset extends SceneImageAsset | DefaultImageAsset>(
      params?: FriendParams<Asset>
    ): Friend {
      const _params = {
        ...params,
        asset: params?.asset || (ImageAsset.Friend as const),
        coordinates: params?.coordinates || [0, 0],
      };
      if (!this.images.includes(_params.asset)) {
        throw new Error(
          `Friend image not loaded. Did you forget to load ${_params.asset}?`
        );
      }
      const image = this.createImage(_params);
      const friend = new Friend(this, image, {
        ..._params,
        mapWidth: this.mapWidth,
        mapHeight: this.mapHeight,
      });
      this.movables.push(friend);
      this.friend = friend;
      return this.friend;
    }

    createInteractable<Asset extends SceneImageAsset>(
      params: InteractableParams<Asset>
    ): Interactable<
      SceneAudioAsset,
      SceneImageAsset,
      SceneSpriteAsset,
      SceneImmovableImages,
      SceneImmovableImageGroups,
      SceneImmovableSprites,
      SceneMovableImages,
      SceneMovableSprites
    > {
      if (!this.images.includes(params.asset)) {
        throw new Error(
          `Interactable image not loaded. Did you forget to load ${params.asset}?`
        );
      }
      const image = this.createImage(params);
      const interactable = new Interactable(this, image, params);
      this.interactables.push(interactable);
      return interactable;
    }

    createMovableSprite<Asset extends SceneSpriteAsset | DefaultSpriteAsset>(
      params: SceneObjectParams<Asset>
    ): Movable<Phaser.GameObjects.Sprite> {
      if (!this.sprites.includes(params.asset)) {
        throw new Error(
          `Movable sprite not loaded. Did you forget to load ${params.asset}?`
        );
      }
      const sprite = this.createSprite(params);
      const movable: Movable<Phaser.GameObjects.Sprite> = new Movable(
        this,
        sprite,
        params
      );
      this.movables.push(movable);
      return movable;
    }

    createMovableImage<Asset extends SceneImageAsset | DefaultImageAsset>(
      params: SceneObjectParams<Asset>
    ): Movable<Phaser.GameObjects.Image> {
      if (!this.images.includes(params.asset)) {
        throw new Error(
          `Movable image not loaded. Did you forget to load ${params.asset}?`
        );
      }
      const image = this.createImage(params);
      const movable: Movable<Phaser.GameObjects.Image> = new Movable(
        this,
        image,
        params
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
          interactable.occupies([newRow, newPosition])
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
