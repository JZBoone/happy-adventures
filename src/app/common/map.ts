import { ImageAsset } from "../types/image";
import { Scene } from "../types/scene";
import { Coordinates, MapObjectsJson, Move } from "../types/map";

export const mapTileSizePx = 50;
export const halfMapTileSizePx = mapTileSizePx / 2;

export const playStartCoordinates: Coordinates = [
  halfMapTileSizePx,
  halfMapTileSizePx,
];

export function createMapImage(
  scene: Phaser.Scene,
  params: { asset: ImageAsset; coordinates: Coordinates }
) {
  const { asset, coordinates } = params;
  return scene.add.image(
    coordinates[1] * mapTileSizePx + halfMapTileSizePx,
    coordinates[0] * mapTileSizePx + halfMapTileSizePx,
    asset
  );
}

export function loadMap<SceneGroundType extends ImageAsset>(
  scene: Phaser.Scene,
  map: SceneGroundType[][]
) {
  return map.map((row, rowIndex) =>
    row.map((asset, positionIndex) => ({
      asset,
      image: createMapImage(scene, {
        asset,
        coordinates: [rowIndex, positionIndex],
      }),
    }))
  );
}

export function mapCoordinates(params: {
  x: number;
  y: number;
  offsetX?: number;
  offsetY?: number;
  height?: number;
  width?: number;
}): Coordinates {
  const { x, y, offsetX, offsetY, height, width } = params;
  const xNormalized =
    x + (offsetX ?? 0) + ((width ?? 1) - 1) * halfMapTileSizePx;
  const yNormalized =
    y + (offsetY ?? 0) + ((height ?? 1) - 1) * halfMapTileSizePx;
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
  coordinates: Coordinates
): Coordinates {
  const [row, position] = coordinates;
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
  coordinates: Coordinates;
  offsetX?: number;
  offsetY?: number;
  height?: number;
  width?: number;
}): [x: number, y: number] {
  const { coordinates, offsetX, offsetY, height, width } = params;
  const [row, position] = coordinates;
  return [
    position * mapTileSizePx +
      halfMapTileSizePx -
      (offsetX ?? 0) -
      ((width ?? 1) - 1) * halfMapTileSizePx,
    row * mapTileSizePx +
      halfMapTileSizePx -
      (offsetY ?? 0) -
      ((height ?? 1) - 1) * halfMapTileSizePx,
  ];
}

export function pointerCoordinates(
  pointer: {
    x: number;
    y: number;
  },
  camera: Phaser.Cameras.Scene2D.Camera
): Coordinates {
  const { x, y } = camera.getWorldPoint(pointer.x, pointer.y);
  const row = Math.floor(y / mapTileSizePx);
  const position = Math.floor(x / mapTileSizePx);
  return [row, position];
}

async function fetchMapJson(mapName: string): Promise<ImageAsset[][]> {
  const result = await fetch(
    `${process.env.API_URL}/assets/map/${mapName}.json`
  );
  return await result.json();
}

async function fetchMapObjects(mapName: string) {
  const result = await fetch(
    `${process.env.API_URL}/assets/map/${mapName}-objects.json`
  );
  return (await result.json()) as MapObjectsJson;
}

export async function fetchMap(mapName: string) {
  const results = await Promise.allSettled([
    fetchMapJson(mapName),
    fetchMapObjects(mapName),
  ]);
  return {
    mapJson: results[0].status === "fulfilled" ? results[0].value : null,
    mapObjectsJson: results[1].status === "fulfilled" ? results[1].value : null,
  };
}

export function mapEditorSceneKey(level: Scene) {
  return `${level}MapEditor`;
}

export async function saveMap(
  level: Scene,
  map: ImageAsset[][],
  mapObjects: object = {}
) {
  const response = await fetch(`${process.env.API_URL}/map/${level}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ map, mapObjects }),
  });
  if (!response.ok) {
    throw new Error("Network response was not ok: " + response.statusText);
  }
  return response.json();
}
