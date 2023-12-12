import Phaser from "phaser";
import { Level1, Level1MapAndAssets } from "./level1/level1";
import { groundTypes as level1GroundTypes } from "./level1/map";
import { Level2, Level2MapAndAssets } from "./level2/level2";
import { groundTypes as level2GroundTypes } from "./level2/map";
import { Level3 } from "./level3/level3";
import { Level4 } from "./level4/level4";
import { withMapBuilder } from "./mixins/with-map-builder";
import { Level } from "./types/level";

export default new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: [
    Level1,
    withMapBuilder(Level1MapAndAssets, Level.Level1, level1GroundTypes),
    Level2,
    withMapBuilder(Level2MapAndAssets, Level.Level2, level2GroundTypes),
    Level3,
    Level4,
  ],
});
