import Phaser from "phaser";
import { Observable, Subject, debounceTime, filter, map, share } from "rxjs";
import { ImageAsset } from "../common/image";
import { AudioAsset } from "../common/audio";
import { loadMap, moveCoordinates } from "../common/map";
import { Movable } from "../common/movable";
import { SpriteAsset } from "../common/sprite";
import { DefaultImageAsset, ISceneWithAssets } from "./with-assets";
import { Constructor } from "./common";
import { NonMovable } from "../common/non-movable";

export type Move = "up" | "down" | "left" | "right";

interface IWithMap<
  SceneAudioAsset extends AudioAsset,
  SceneImageAsset extends ImageAsset,
  SceneSpriteAsset extends SpriteAsset,
> extends ISceneWithAssets<SceneAudioAsset, SceneImageAsset, SceneSpriteAsset> {
  friend: Movable<Phaser.GameObjects.Image>;
  moves$: Observable<[row: number, position: number]>;
  outOfBoundMoves$: Observable<[row: number, position: number]>;
}

export function withMap<
  SceneAudioAsset extends AudioAsset,
  SceneImageAsset extends ImageAsset,
  SceneSpriteAsset extends SpriteAsset,
>(
  Base: Constructor<
    ISceneWithAssets<SceneAudioAsset, SceneImageAsset, SceneSpriteAsset>
  >,
  sceneMap: ImageAsset[][]
) {
  return class SceneWithMap
    extends Base
    implements IWithMap<SceneAudioAsset, SceneImageAsset, SceneSpriteAsset>
  {
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    friend!: Movable<Phaser.GameObjects.Image>;
    private _moves$ = new Subject<Move>();
    private allMoveCoordinates$ = this._moves$.asObservable().pipe(
      map((move) => moveCoordinates(move, ...this.friend.coordinates())),
      share()
    );
    moves$ = this.allMoveCoordinates$.pipe(
      filter((coordinates) => !this.moveIsOutOfBounds(...coordinates))
    );
    outOfBoundMoves$ = this.allMoveCoordinates$.pipe(
      filter((coordinates) => this.moveIsOutOfBounds(...coordinates))
    );

    private movables: Movable<
      Phaser.GameObjects.Image | Phaser.GameObjects.Sprite
    >[] = [];

    create() {
      loadMap(this, sceneMap);
      this.cursors = this.input.keyboard!.createCursorKeys();
      this.outOfBoundMoves$.pipe(debounceTime(50)).subscribe(() => {
        this.onInvalidMove();
      });
    }

    createFriend(row = 0, position = 0) {
      this.friend = this.createMovable({
        row,
        position,
        asset: ImageAsset.Friend,
      });
    }

    update() {
      const move = this.getMove();
      if (!move) {
        return;
      }
      this._moves$.next(move);
    }

    onInvalidMove() {
      this.playAudio(AudioAsset.Thump);
    }

    createNonMovableImage(params: {
      asset: SceneImageAsset | DefaultImageAsset;
      row: number;
      position: number;
      offsetX?: number;
      offsetY?: number;
      height?: number;
      width?: number;
    }): NonMovable<Phaser.GameObjects.Image> {
      const { asset, row, position, offsetX, offsetY, height, width } = params;
      if (!this.images.includes(asset)) {
        throw new Error(
          `Non movable image not loaded. Did you forget to load ${asset}?`
        );
      }
      const image = this.createImage({
        row,
        position,
        offsetX,
        offsetY,
        width,
        height,
        asset,
      });
      return new NonMovable(image, { offsetX, offsetY, width, height });
    }

    createNonMovableSprite(params: {
      asset: SceneSpriteAsset;
      row: number;
      position: number;
      offsetX?: number;
      offsetY?: number;
      height?: number;
      width?: number;
    }): NonMovable<Phaser.GameObjects.Sprite> {
      const { asset, row, position, offsetX, offsetY, height, width } = params;
      if (!this.sprites.includes(asset)) {
        throw new Error(
          `Non movable sprite not loaded. Did you forget to load ${asset}?`
        );
      }
      const sprite = this.createSprite({
        row,
        position,
        offsetX,
        offsetY,
        height,
        width,
        asset: asset as SceneSpriteAsset,
      });
      return new NonMovable(sprite, { offsetX, offsetY, width, height });
    }

    createMovable(params: {
      asset: SceneImageAsset | SceneSpriteAsset | DefaultImageAsset;
      row: number;
      position: number;
      offsetX?: number;
      offsetY?: number;
    }): Movable<Phaser.GameObjects.Image | Phaser.GameObjects.Sprite> {
      const { asset, row, position, offsetX, offsetY } = params;
      const isImage = this.images.includes(asset as SceneImageAsset);
      const isSprite = this.sprites.includes(asset as SceneSpriteAsset);
      if (!isImage && !isSprite) {
        throw new Error(
          `Movable asset not loaded. Did you forget to load ${asset}?`
        );
      }
      const createdAsset = isImage
        ? this.createImage({
            row,
            position,
            offsetX,
            offsetY,
            asset: asset as SceneImageAsset,
          })
        : this.createSprite({
            row,
            position,
            offsetX,
            offsetY,
            asset: asset as SceneSpriteAsset,
          });
      const movable = new Movable(this, createdAsset, { offsetX, offsetY });
      this.movables.push(movable);
      return movable;
    }

    private moveIsOutOfBounds(newRow: number, newPosition: number): boolean {
      return (
        newRow < 0 ||
        newRow > sceneMap.length - 1 ||
        newPosition < 0 ||
        newPosition > sceneMap[0].length - 1
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
  };
}
