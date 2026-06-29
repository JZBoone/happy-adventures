---
name: add-level
description: >-
  Add a new level to the happy-adventures Phaser game. Use when the user wants to
  create a new level (e.g. "add level7", "create a new level", "scaffold the next
  level"). Scaffolds the level + assets TypeScript files, creates the map JSON,
  registers the scene, wires up the level flow from the previous level, and validates.
---

# Add a new level

This skill adds **level N** (the next number after the current highest level) to the
`happy-adventures` Phaser 3 + TypeScript game. Follow the steps in order. Paths are
relative to the repo root.

## Background

Each level is a self-contained Phaser scene composed from two mixins (`withMap`,
`withAssets`). At runtime the map is **fetched** from `src/assets/map/levelN.json`
(tile grid) and `src/assets/map/levelN-objects.json` (object placements), so those JSON
files **must exist** for the level to load — even an empty starter version. Levels form a
chain: each level's win condition calls `this.scene.start(...)` for the next scene, and
the final level transitions to `Scene.Credits`.

Canonical examples to mirror:
- `src/app/level1/level1.ts` + `level1-assets.ts` — simplest level (boat/castle).
- `src/app/level6/level6.ts` + `level6-assets.ts` — current last level; camera + restart.

## Step 1 — Determine N and the current last level

- List `src/app/level*/` directories; the highest existing number is `M`, so **N = M + 1**.
- Find the **current last level**: the level whose completion logic calls
  `this.scene.start(Scene.Credits)` (currently `src/app/level6/level6.ts`). You will
  rewire this in Step 7.

## Step 2 — Add the scene enum

In `src/app/types/scene.ts`, add a member to the `Scene` enum, keeping it ordered just
before `Credits`:

```ts
LevelN = "levelN",
```

(e.g. `Level7 = "level7"`)

## Step 3 — Create `src/app/levelN/levelN-assets.ts`

Mirror `src/app/level6/level6-assets.ts`. Define the ground tiles, what to load, and the
object collections:

```ts
import Phaser from "phaser";
import { withMap } from "../mixins/with-map";
import { withAssets } from "../mixins/with-assets";
import { ImageAsset } from "../types/image";
import { Scene } from "../types/scene";
import { SpriteAsset } from "../types/sprite";
import { AudioAsset } from "../types/audio";

export const groundTypes = [
  // ImageAsset values the player can stand on / that appear in the tile grid
  ImageAsset.Forest,
] as const;

export type GroundType = (typeof groundTypes)[number];

export const assetOptions = {
  // `images` MUST include every ground type above, plus any object images
  images: [ImageAsset.Forest],
  sprites: [],
  audio: [],
} as const;

export const mapOptions = {
  level: Scene.LevelN,
  groundTypes,
  immovableSprites: {},
  movableSprites: {},
  movableImages: {},
  immovableImageGroups: {},
} as const;

export class LevelNMapAndAssets extends withMap(
  withAssets(Phaser.Scene, assetOptions),
  mapOptions
) {}
```

Rules:
- Every entry in `groundTypes` must also be in `assetOptions.images`.
- Every object declared in `mapOptions` (sprites/images/groups) must have its asset
  loaded in `assetOptions`.
- Leave unused object collections as `{}`.

## Step 4 — Create `src/app/levelN/levelN.ts`

Mirror `src/app/level1/level1.ts` (simple) or `level6.ts` (camera/restart). Minimum shape:

```ts
import { takeWhile } from "rxjs";
import { Scene } from "../types/scene";
import { showLevelStartText, newPromiseLasting } from "../common/helpers";
import { AudioAsset } from "../types/audio";
import { Coordinates } from "../types/map";
import { GroundType, LevelNMapAndAssets } from "./levelN-assets";

export class LevelN extends LevelNMapAndAssets {
  private levelCompleted = false;

  constructor() {
    super({ key: Scene.LevelN });
  }

  async create() {
    await super.create();
    this.levelCompleted = false;
    showLevelStartText(this, N); // N as a number literal
    this.createFriend();
    this.moves$
      .pipe(takeWhile(() => !this.levelCompleted))
      .subscribe(({ coordinates, groundType }) =>
        this.handleMove(coordinates, groundType)
      );
  }

  private async handleMove(coordinates: Coordinates, groundType: GroundType) {
    // TODO: real game logic / win condition.
    this.friend.move(coordinates);
  }

  private async completeLevel() {
    this.levelCompleted = true;
    this.playSound(AudioAsset.Tada);
    // This is the new LAST level, so transition to Credits.
    // If a later level is added afterwards, this becomes Scene.Level(N+1).
    await newPromiseLasting(this, 500, () => this.scene.start(Scene.Credits));
  }
}
```

Helpers available: `showLevelStartText`, `newPromiseLasting` (`src/app/common/helpers.ts`);
`this.createFriend(...)`, `this.friend.move(...)`, `this.playSound(...)`, `this.moves$`,
`this.invalidMoves$`, `this.shutdown$` come from the mixins.

## Step 5 — Create the map JSON files

Two approaches. **Default: the in-game editor.** Ask the user which they want if unclear.

### Approach A — in-game map editor (default, recommended)

Scaffold minimal valid files so the level loads, then design visually:

- `src/assets/map/levelN.json` — a small uniform grid (e.g. 12×12) where every cell is
  `groundTypes[0]` (the string value, e.g. `"forest"`). Must be a JSON 2D array of
  ground-type strings.
- `src/assets/map/levelN-objects.json` — the empty skeleton:

```json
{
  "immovableImages": {},
  "immovableSprites": {},
  "immovableImageGroups": {},
  "movableSprites": {},
  "movableImages": {},
  "interactables": []
}
```

Then tell the user to design the map:
1. Run `npm start` and open `localhost:3000`; play to level N.
2. Press `e` to open the map builder. Hotkeys (see `README.md`):
   `arrows` move camera, `i`/`o` zoom, **right-click** changes a tile,
   **left-click+drag** paints/moves objects, `shift+t` taller, `shift+w` wider,
   **`s` saves**, `escape` exits.
3. Saving POSTs to the local dev server (`/map/:level` in `src/server.js`), which
   rewrites `levelN.json` and `levelN-objects.json` on disk.

### Approach B — generate the JSON directly

Write the full `levelN.json` grid and populate `levelN-objects.json` from the user's
description. Tedious and error-prone for large maps — only do this when asked. Constraints:
- Every tile string in `levelN.json` must be a value in `groundTypes`.
- Every object's `asset` in `levelN-objects.json` must match an entry in `mapOptions` /
  `assetOptions`, with `coordinates: [col, row]`.

## Step 6 — Register the level in `src/app/game.ts`

Add imports near the other level imports:

```ts
import { LevelN } from "./levelN/levelN";
import { LevelNMapAndAssets } from "./levelN/levelN-assets";
```

In the `scene:` array, **before `Credits`**, add both the level and its map builder:

```ts
LevelN,
withMapBuilder(LevelNMapAndAssets, Scene.LevelN, LevelN),
```

## Step 7 — Wire the previous level's exit

In the previously-last level (found in Step 1, e.g. `src/app/level6/level6.ts`), change
its completion transition from:

```ts
this.scene.start(Scene.Credits)
```

to:

```ts
this.scene.start(Scene.LevelN)
```

so the new level now sits between the old last level and the credits.

## Step 8 — Add new assets (only if needed)

Most levels need new art and/or sound. **Always reuse existing assets first** — there are
~60 images in `src/assets/image/` and ~20 sounds in `src/assets/audio/`. List them and
check before adding anything new. The asset's enum value is always the **kebab-case
filename without extension** (e.g. `magic-tree.png` ↔ `MagicTree = "magic-tree"`).

### Naming / format rules (must follow)

- **Images & sprites:** PNG only, at `src/assets/image/{name}.png`, with transparency.
- **Audio:** MP3 only, at `src/assets/audio/{name}.mp3`.
- **Ground tiles must be exactly 50×50** (`mapTileSizePx`). Objects are free-size but
  designed around the 50px grid (e.g. boat 56×28, friend 30×50).
- Filename, enum string value, and the level's `assetOptions` reference must all match.

### Adding an image (tile or static object)

The user provides a source image **as a file** (drag-and-drop into the terminal inserts
its path; or they save it somewhere and give the path). A plain image *pasted into chat*
is only viewable — it can't be resized; you need a real file path.

Then run the import script (uses the project's existing `canvas` dep, no install needed):

```bash
# Ground tile → exactly 50×50:
node scripts/import-image.js <src-path> <kebab-name> --tile

# Object/sprite → scale down to fit a box, aspect preserved & transparency kept:
node scripts/import-image.js <src-path> <kebab-name> --max=100x100
```

It writes `src/assets/image/<kebab-name>.png`. After that:
1. Add the enum member to `src/app/types/image.ts` (`<PascalName> = "<kebab-name>"`).
2. Reference it in the level's `assetOptions.images`, and in `groundTypes` +
   `mapOptions` if it's a tile, or the relevant object collection if it's an object.

### Adding an animated sprite

Sprites are horizontal sprite **sheets** (N frames of equal size). Import the sheet with
`import-image.js` (often no `--tile`/`--max` so frame dimensions are preserved), then
register it in `src/app/types/sprite.ts`: add a `SpriteAsset` enum member and a
`SpriteAssets[...]` entry with `frameConfig: { frameWidth, frameHeight }` and an `anims()`
function. Mirror the existing `Castle` / `CandyCastle` entries.

### Adding audio

You can't author sound effects. **Tell the user exactly where to put the file** and let
them drop it in:
- Path: `src/assets/audio/<kebab-name>.mp3` (MP3, lowercase kebab-case name).
Then add the enum member to `src/app/types/audio.ts` and reference it in
`assetOptions.audio`. Prefer reusing an existing sound.

## Step 9 — Validate

- `npm test` — `test/map.test.ts` auto-discovers every `level*` dir and checks that all
  map tiles are declared in `groundTypes` and that `levelN-objects.json` matches the
  typed schema. The new level is covered automatically.
- `npm run lint`.
- `npm start`, play to level N: confirm it loads, the start text shows, and the win
  condition transitions to the correct next scene.

## Checklist

- [ ] `Scene.LevelN` added to `src/app/types/scene.ts`
- [ ] `src/app/levelN/levelN-assets.ts` created
- [ ] `src/app/levelN/levelN.ts` created
- [ ] `src/assets/map/levelN.json` + `levelN-objects.json` created
- [ ] `LevelN` + `withMapBuilder(...)` registered in `src/app/game.ts`
- [ ] Previous last level rewired from `Scene.Credits` to `Scene.LevelN`
- [ ] New assets imported (reuse first; `scripts/import-image.js` for images, drop-in for audio) + enums added
- [ ] `npm test` and `npm run lint` pass; level plays through
