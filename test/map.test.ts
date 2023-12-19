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
