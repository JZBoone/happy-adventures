import Phaser from "phaser";
import { Move } from "./mixins/with-moves";
import { ImageAsset } from "./image";

export function showLevelStartText(scene: Phaser.Scene, levelNumber: number) {
  let levelText = scene.add
    .text(
      scene.cameras.main.centerX,
      scene.cameras.main.centerY,
      `Level ${levelNumber}`,
      {
        font: "64px Arial",
      }
    )
    .setOrigin(0.5, 0.5);

  scene.time.addEvent({
    delay: 4_000,
    callback: () => levelText.setVisible(false),
    loop: false,
  });
}

export function disappearFriend(
  scene: Phaser.Scene,
  friend: Phaser.GameObjects.Image
) {
  scene.tweens.add({
    targets: friend,
    scaleX: 0, // Scale horizontally to 0
    scaleY: 0, // Scale vertically to 0
    ease: "Linear", // Use a linear easing
    duration: 2000, // Duration of the tween in milliseconds
    onComplete: () => {
      friend.setVisible(false); // Hide the sprite after scaling down
    },
  });
}

export const mapTileSizePx = 50;
export const halfMapTileSizePx = mapTileSizePx / 2;

export const playStartCoordinates: [x: number, y: number] = [
  halfMapTileSizePx,
  halfMapTileSizePx,
];

export function loadMap(scene: Phaser.Scene, map: ImageAsset[][]) {
  map.forEach((row, rowIndex) => {
    row.forEach((groundType, positionIndex) => {
      scene.add.image(
        positionIndex * mapTileSizePx + halfMapTileSizePx,
        rowIndex * mapTileSizePx + halfMapTileSizePx,
        groundType
      );
    });
  });
}

export function mapCoordinates(params: {
  x: number;
  y: number;
  xOffset?: number;
  yOffset?: number;
}): [row: number, position: number] {
  const { x, y, xOffset, yOffset } = params;
  const xNormalized = x + (xOffset ?? 0);
  const yNormalized = y + (yOffset ?? 0);
  const index = (normalizedXorY: number) => {
    if (normalizedXorY === halfMapTileSizePx) {
      return 0;
    }
    return (normalizedXorY - halfMapTileSizePx) / mapTileSizePx;
  };
  return [index(yNormalized), index(xNormalized)];
}

export function moveCoordinates(
  move: Move,
  row: number,
  position: number
): [row: number, position: number] {
  switch (move) {
    case "up":
      return [row - 1, position];
    case "down":
      return [row + 1, position];
    case "left":
      return [row, position - 1];
    case "right":
      return [row, position + 1];
  }
}

export function worldPosition(params: {
  row: number;
  position: number;
  xOffset?: number;
  yOffset?: number;
}): [x: number, y: number] {
  const { row, position, xOffset, yOffset } = params;
  return [
    position * mapTileSizePx + halfMapTileSizePx + (xOffset ?? 0),
    row * mapTileSizePx + halfMapTileSizePx + (yOffset ?? 0),
  ];
}
