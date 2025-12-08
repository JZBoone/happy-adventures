# Happy Adventures - Copilot Instructions

This document provides guidance for AI coding agents to effectively contribute to the Happy Adventures codebase.

## About This Project

Happy Adventures is a 2D adventure game built with the [Phaser](https://phaser.io/) framework. The player navigates through different levels, interacting with objects and characters.

## Getting Started

To run the application locally, follow these steps:

1.  Install dependencies: `npm ci`
2.  Start the development server: `npm start`
3.  Open your browser to `http://localhost:3000`

## Architecture

The game is structured around Phaser's `Scene` concept. Each level is a separate scene.

### Game Structure

-   **Main Entry Point**: `src/app/game.ts` configures the Phaser game and lists all the scenes.
-   **Scenes/Levels**: Each level is a class that extends a base class containing its assets. For example, `src/app/level1/level1.ts` is the scene for the first level.
-   **Assets**: Each level has a corresponding assets file (e.g., `src/app/level1/level1-assets.ts`) that preloads all necessary images, audio, and other resources.
-   **Map Data**: Level layouts are defined in JSON files located in `src/assets/map/`. For example, `src/assets/map/level1.json` defines the tilemap for level 1.

### Event Handling

The game uses `rxjs` for reactive event handling. Player movements are handled through observables like `moves$`. When adding new interactive elements, consider using observables to manage state and events.

```typescript
// src/app/level1/level1.ts
this.moves$
    .pipe(takeWhile(() => !this.levelCompleted))
    .subscribe(({ coordinates, groundType }) =>
    this.handleMove(coordinates, groundType)
    );
```

## Development Workflow

### Running the App

-   `npm start`: Starts a development server using `nodemon` and `esbuild`. The application will automatically reload when files are changed.

### Building for Production

-   `npm run build:prod`: Creates a production-ready build in the `dist/` directory.

### Running Tests

-   `npm test`: Executes the test suite using Jest. Tests are located in the `test/` directory.

### The Map Editor

A crucial part of the development workflow is the in-game map editor.

-   **Activation**: Press the `e` key while on a level in development mode.
-   **Functionality**: The editor allows you to modify the tilemap, move objects, and edit dialogs.
-   **Saving**: Press `s` to save your changes. This will update the corresponding JSON map file in `src/assets/map/`.
-   **Implementation**: The map editor functionality is added to level scenes using the `withMapBuilder` mixin found in `src/app/mixins/with-map-builder.ts`.

## Key Files and Directories

-   `src/app/game.ts`: The main game configuration and scene registry.
-   `src/app/`: Contains the core application logic, divided by level.
-   `src/app/common/`: Shared helpers and classes used across multiple levels.
-   `src/app/mixins/`: Reusable functionality that can be mixed into scenes, like `with-map-builder.ts`.
-   `src/assets/`: All game assets (images, audio, maps).
-   `package.json`: Defines scripts and dependencies.
-   `build.js`: The esbuild configuration for building the project.
