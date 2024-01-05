import { readdirSync } from "fs";
import { mapCoordinates, worldPosition } from "../src/app/common/map";
import { Coordinates } from "../src/app/types/map";

const testCases: {
  width?: number;
  height?: number;
  offsetX?: number;
  offsetY?: number;
  coordinates: Coordinates;
  worldXY: [x: number, y: number];
}[] = [
  {
    coordinates: [0, 0],
    worldXY: [25, 25],
  },
  {
    coordinates: [33, 39],
    offsetY: -15,
    worldXY: [1975, 1690],
  },
  {
    coordinates: [1, 1],
    height: 2,
    width: 2,
    worldXY: [50, 50],
  },
  {
    coordinates: [1, 0],
    height: 2,
    width: 1,
    worldXY: [25, 50],
  },
  {
    coordinates: [0, 1],
    height: 1,
    width: 2,
    worldXY: [50, 25],
  },
];

describe("worldPosition()", () => {
  test.each(testCases)(
    "it returns correct x y position",
    ({ height, width, coordinates, worldXY, offsetX, offsetY }) => {
      expect(
        worldPosition({ coordinates, height, width, offsetX, offsetY })
      ).toEqual(worldXY);
    }
  );
});

describe("mapCoordinates()", () => {
  test.each(testCases)(
    "it returns correct x y position",
    ({ height, width, coordinates, worldXY, offsetX, offsetY }) => {
      const [x, y] = worldXY;
      expect(mapCoordinates({ x, y, height, width, offsetX, offsetY })).toEqual(
        coordinates
      );
    }
  );
});

function levelDirectoryNames() {
  const dirContents = readdirSync("./src/app", { withFileTypes: true });
  return dirContents
    .filter((item) => item.isDirectory() && item.name.startsWith("level"))
    .map(({ name }) => name);
}

describe("map schema", () => {
  test("ground types are valid", () => {
    for (const level of levelDirectoryNames()) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const map = require(`../src/assets/map/${level}.json`);
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { groundTypes } = require(`../src/app/${level}/${level}-assets`);
      for (const row of map) {
        for (const groundType of row) {
          if (!groundTypes.includes(groundType)) {
            throw new Error(`${level} has invalid ground type ${groundType}`);
          }
        }
      }
    }
  });
  test("objects are valid", () => {
    for (const level of levelDirectoryNames()) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mapObjects = require(`../src/assets/map/${level}-objects.json`);
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { mapOptions } = require(`../src/app/${level}/${level}-assets`);
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { assetOptions } = require(`../src/app/${level}/${level}-assets`);
      expect(mapObjects).toBeDefined();
      expect(mapOptions).toBeDefined();
      expect(assetOptions).toBeDefined();
      for (const [key, value] of Object.entries(
        mapObjects.immovableSprites || {}
      )) {
        const objectSpec = mapOptions.immovableSprites[key];
        expect(objectSpec).toBeDefined();
        expect(objectSpec.asset).toBe((value as { asset: string }).asset);
      }
      for (const [key, value] of Object.entries(
        mapObjects.movableImages || {}
      )) {
        const objectSpec = mapOptions.movableImages[key];
        expect(objectSpec).toBeDefined();
        expect(objectSpec.asset).toBe((value as { asset: string }).asset);
      }
      for (const [key, value] of Object.entries(
        mapObjects.immovableImageGroups || {}
      )) {
        const objectSpec = mapOptions.immovableImageGroups[key];
        expect(objectSpec).toBeDefined();
        expect(objectSpec.asset).toBe((value as { asset: string }).asset);
      }
      for (const [key, value] of Object.entries(
        mapObjects.immovableImages || {}
      )) {
        const objectSpec = mapOptions.immovableImages[key];
        expect(objectSpec).toBeDefined();
        expect(objectSpec.asset).toBe((value as { asset: string }).asset);
      }
      for (const interactable of mapObjects.interactables || []) {
        if (!assetOptions.images.includes(interactable.asset)) {
          throw new Error(
            `${level} interactable asset ${interactable.asset} not loaded`
          );
        }
      }
    }
  });
});
