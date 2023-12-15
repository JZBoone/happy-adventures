import Phaser from "phaser";
import { Immovable } from "../src/app/common/immovable";
import { describe, expect, test } from "@jest/globals";
import { Coordinates } from "../src/app/types/map";

describe("Immovable", () => {
  describe("isAdjacentTo", () => {
    describe("1x1", () => {
      const immovable = new Immovable(
        // 3, 2
        { x: 125, y: 175 } as Phaser.GameObjects.Image,
        {}
      );

      const adjacentCoordinates: Coordinates[] = [
        [2, 2],
        [3, 3],
        [4, 2],
        [3, 1],
      ];

      test.each(adjacentCoordinates)(
        "should be adjacent to [%s, %s]",
        (row, position) => {
          expect(immovable.isAdjacentTo([row, position])).toBe(true);
        }
      );

      const diagonalCoordinates: Coordinates[] = [
        [2, 1],
        [2, 3],
        [4, 1],
        [4, 3],
      ];

      test.each(diagonalCoordinates)(
        "should not be adjacent to diagonal [%s, %s]",
        (row, position) => {
          expect(immovable.isAdjacentTo([row, position])).toBe(false);
        }
      );
    });
    describe("2x2", () => {
      const immovable = new Immovable(
        // 9, 2
        { x: 100, y: 450 } as Phaser.GameObjects.Image,
        {
          width: 2,
          height: 2,
        }
      );

      const adjacentCoordinates: Coordinates[] = [
        [8, 0],
        [9, 0],
        [7, 1],
        [7, 2],
        [8, 3],
        [9, 3],
        [10, 1],
        [10, 2],
      ];

      test.each(adjacentCoordinates)(
        "should be adjacent to [%s, %s]",
        (row, position) => {
          expect(immovable.isAdjacentTo([row, position])).toBe(true);
        }
      );

      const diagonalCoordinates: Coordinates[] = [
        [7, 0],
        [7, 3],
        [10, 0],
        [10, 3],
      ];

      test.each(diagonalCoordinates)(
        "should not be adjacent to diagonal [%s, %s]",
        (row, position) => {
          expect(immovable.isAdjacentTo([row, position])).toBe(false);
        }
      );
    });
  });
});
