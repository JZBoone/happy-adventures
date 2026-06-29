import { interval, takeUntil, takeWhile } from "rxjs";
import { isEqual } from "lodash";
import { Scene } from "../types/scene";
import { showLevelStartText, newPromiseLasting } from "../common/helpers";
import { AudioAsset } from "../types/audio";
import { ImageAsset } from "../types/image";
import { LeverAnimation } from "../types/sprite";
import { Coordinates, Move } from "../types/map";
import { moveCoordinates } from "../common/map";
import { Movable } from "../common/movable";
import { GroundType, Level7MapAndAssets } from "./level7-assets";

// How often the ghost takes a step. Lower = scarier.
const GHOST_STEP_MS = 450;

const MOVES: Move[] = ["up", "down", "left", "right"];

function oppositeMove(move: Move): Move {
  switch (move) {
    case "up":
      return "down";
    case "down":
      return "up";
    case "left":
      return "right";
    case "right":
      return "left";
  }
}

export class Level7 extends Level7MapAndAssets {
  private didWin = false;
  private readonly entrance: Coordinates = [1, 1];
  private readonly ghostStart: Coordinates = [7, 3];

  private ghost!: Movable<Phaser.GameObjects.Image>;
  private ghostCoordinates: Coordinates = this.ghostStart;
  private ghostDirection?: Move;
  // Mirror of the friend's logical tile, so collision checks don't read
  // mid-tween pixel positions.
  private friendCoordinates: Coordinates = this.entrance;

  constructor() {
    super({ key: Scene.Level7 });
  }

  async create() {
    await super.create();
    this.didWin = false;
    this.friendCoordinates = this.entrance;
    showLevelStartText(this, 7);
    this.createFriend({ coordinates: this.entrance });
    this.createGhost();
    this.moves$
      .pipe(
        takeWhile(() => !this.didWin),
        takeUntil(this.shutdown$)
      )
      .subscribe(({ coordinates, groundType }) =>
        this.handleMove(coordinates, groundType)
      );
    interval(GHOST_STEP_MS)
      .pipe(
        takeWhile(() => !this.didWin),
        takeUntil(this.shutdown$)
      )
      .subscribe(() => this.moveGhost());
  }

  private createGhost() {
    // Built directly (not via createMovableImage) so the ghost stays out of
    // `this.movables`; otherwise its move tween would block player input.
    const image = this.createImage({
      asset: ImageAsset.Ghost,
      coordinates: this.ghostStart,
    });
    this.ghost = new Movable(this, image);
    this.ghostCoordinates = this.ghostStart;
    this.ghostDirection = undefined;
  }

  private async handleMove(coordinates: Coordinates, groundType: GroundType) {
    // Reaching the lever next to the cage frees the friends and wins the level.
    if (this.immovableSprites.lever.occupies(coordinates)) {
      this.completeLevel(coordinates);
      return;
    }
    switch (groundType) {
      case ImageAsset.MossyStone:
        // Walkable maze path.
        this.friendCoordinates = coordinates;
        this.friend.move(coordinates);
        // Walking straight into the ghost is fatal.
        if (isEqual(coordinates, this.ghostCoordinates)) {
          this.caughtByGhost();
        }
        break;
      case ImageAsset.FirePit:
        // Hazard: fall in and start the maze over.
        await this.sendBackToStart(coordinates, AudioAsset.Sizzle);
        break;
      case ImageAsset.MossyWall:
        // Walls block movement: do nothing.
        break;
    }
  }

  private moveGhost() {
    if (this.movesDisabled || this.didWin) {
      return;
    }
    const next = this.pickGhostNextTile();
    if (!next) {
      return;
    }
    this.ghostDirection = next.move;
    this.ghostCoordinates = next.coordinates;
    this.ghost.move(next.coordinates);
    // The ghost catching the player is fatal.
    if (isEqual(next.coordinates, this.friendCoordinates)) {
      this.caughtByGhost();
    }
  }

  private pickGhostNextTile(): { move: Move; coordinates: Coordinates } | null {
    const options = MOVES.map((move) => ({
      move,
      coordinates: moveCoordinates(move, this.ghostCoordinates),
    })).filter(({ coordinates }) => this.ghostCanEnter(coordinates));
    if (options.length === 0) {
      return null;
    }
    // Pac-Man style: don't reverse unless it's the only way out, so the ghost
    // flows through corridors and only "decides" at intersections.
    const reverse = this.ghostDirection && oppositeMove(this.ghostDirection);
    const forward = options.filter(({ move }) => move !== reverse);
    const pool = forward.length > 0 ? forward : options;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  private ghostCanEnter([row, position]: Coordinates): boolean {
    const tile = this.map[row]?.[position];
    if (!tile || tile.asset !== ImageAsset.MossyStone) {
      return false;
    }
    // Keep the ghost off the goal and the cage.
    return (
      !this.immovableSprites.lever.occupies([row, position]) &&
      !this.immovableImages.cage.occupies([row, position])
    );
  }

  private async caughtByGhost() {
    this.movesDisabled = true;
    this.playSound(AudioAsset.FunnyCry, { volume: 0.5 });
    await this.friend.disappear();
    this.ghost.move(this.ghostStart, { noAnimation: true });
    this.ghostCoordinates = this.ghostStart;
    this.ghostDirection = undefined;
    this.startOver();
  }

  private async sendBackToStart(coordinates: Coordinates, sound: AudioAsset) {
    this.movesDisabled = true;
    this.playSound(sound, { volume: 0.5 });
    this.friend.move(coordinates);
    await this.friend.disappear();
    this.startOver();
  }

  private startOver() {
    this.friendCoordinates = this.entrance;
    this.friend.move(this.entrance, { noAnimation: true });
    this.friend.phaserObject.setVisible(true);
    this.movesDisabled = false;
  }

  private async completeLevel(coordinates: Coordinates) {
    this.didWin = true;
    // Pull the lever, then the cage opens and the friends are free!
    this.immovableSprites.lever.phaserObject.anims.play(LeverAnimation.Pull);
    await this.friend.move(coordinates);
    this.immovableImages.cage.phaserObject.setVisible(false);
    this.playSound(AudioAsset.Cheer);
    // This is the last level, so head to the credits.
    await newPromiseLasting(this, 2_000, () => this.scene.start(Scene.Credits));
  }
}
