# Happy Adventures

A 2D adventure game built with [Phaser](https://phaser.io/), inspired by [vim-adventures](https://vim-adventures.com/). The player navigates levels with the **arrow keys**, interacting with objects and characters. It targets an up-to-date version of Chrome and requires a keyboard.

Deployed build: https://storage.googleapis.com/happy-adventures/index.html

## Commands

Use Node `22.23.1` (see `.nvmrc`).

- `npm ci` — install dependencies
- `npm start` — start the dev server on port 3000, then open `http://localhost:3000`. This runs `src/server.js` (an Express server) under `nodemon`; the server bundles the app with esbuild on demand at `GET /js/bundle.js` and handles map saves via `POST /map/:level`.
- `npm test` — run the Jest suite (`test/*.test.ts`)
- `npm run lint` — run eslint
- `npm run build:dev` / `npm run build:prod` — esbuild build via `build.js` (dev → `src/js/bundle.js`, prod → `dist/`)
- `npm run deploy` — prod build + upload to GCS via `gsutil` (requires bucket access)

## Architecture

The game is structured around Phaser `Scene`s. Each level is a scene.

- **Entry point** — `src/app/game.ts` configures the Phaser game and registers all scenes. **Order matters**: `PlayerSelection` → `Instructions` → levels 1–6 → `Credits` → `TheEnd`.
- **Levels** — each lives in `src/app/levelN/` as a pair:
  - `levelN.ts` — the scene logic (e.g. `Level1` extends the assets base class below).
  - `levelN-assets.ts` — the `LevelNMapAndAssets` base class, composed from the `withAssets` and `withMap` mixins (`src/app/mixins/`). It declares the level's assets and `mapOptions` (ground types, immovable/movable sprites, etc.).
  - In `game.ts`, each level registers both its scene **and** an editor variant via `withMapBuilder(LevelNMapAndAssets, Scene.LevelN, LevelN)`.
- **Maps** — level layouts live in `src/assets/map/`: `levelN.json` (tile grid) and `levelN-objects.json` (placed objects).
- **Shared code** — `src/app/common/` holds reusable helpers and classes (`helpers.ts`, `friend.ts`, `movable.ts`, `immovable.ts`, `interactable.ts`, `map.ts`, `assets.ts`). Types live in `src/app/types/`.
- **Events** — the game uses **rxjs** for input and events. Levels subscribe to observables like `this.moves$` (and `this.invalidMoves$`) to drive movement. Prefer observables when adding new interactive behavior.

```typescript
// src/app/level1/level1.ts
this.moves$
  .pipe(takeWhile(() => !this.levelCompleted))
  .subscribe(({ coordinates, groundType }) =>
    this.handleMove(coordinates, groundType)
  );
```

## Map editor

While running locally in dev mode, press `e` on a level to launch the in-game map editor (the `withMapBuilder` mixin in `src/app/mixins/with-map-builder.ts`). It lets you edit the tilemap, move/clone/delete objects, and edit dialogs. Press `s` to save — this POSTs to `/map/:level`, which writes the updated `levelN.json` and `levelN-objects.json` files. See `README.md` for the full keybinding list.

## Adding a level

The `add-level` skill scaffolds a new level end-to-end: the `levelN.ts` + `levelN-assets.ts` files, the map JSON, scene registration in `game.ts`, and wiring from the previous level. To do it by hand, mirror an existing `levelN/` pair and register both the scene and its `withMapBuilder(...)` variant in `src/app/game.ts`.

## Key files

- `src/app/game.ts` — game config and scene registry
- `src/server.js` — dev Express server (bundling + map saving)
- `build.js`, `esbuild.config.js` — build configuration
- `src/app/common/` — shared helpers and classes
- `src/app/mixins/` — reusable scene functionality (`with-assets`, `with-map`, `with-map-builder`)
- `src/assets/` — images, audio, and map JSON
