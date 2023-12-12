import Phaser from "phaser";
import { Level1, Level1MapAndAssets } from "./level1/level1";
import { Level2, Level2MapAndAssets } from "./level2/level2";
import { Level3, Level3MapAndAssets } from "./level3/level3";
import { Level4, Level4MapAndAssets } from "./level4/level4";
import { worldHeight, worldWidth } from "./types/world";
import { withMapBuilder } from "./mixins/with-map-builder";
import { Level } from "./types/level";

const levels = [
  {
    level: Level1,
    mapBuilder: withMapBuilder(Level1MapAndAssets, Level.Level1),
  },
  {
    level: Level2,
    mapBuilder: withMapBuilder(Level2MapAndAssets, Level.Level2),
  },
  {
    level: Level3,
    mapBuilder: withMapBuilder(Level3MapAndAssets, Level.Level3),
  },
  {
    level: Level4,
    mapBuilder: withMapBuilder(Level4MapAndAssets, Level.Level4),
  },
];

export default new Phaser.Game({
  type: Phaser.AUTO,
  width: worldWidth,
  height: worldHeight,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: [
    ...levels.map(({ level }) => level),
    ...levels.map(({ mapBuilder }) => mapBuilder),
  ],
});
