import Phaser from "phaser";
import { Level1, Level1MapAndAssets } from "./level1/level1";
import { groundTypes as level1GroundTypes } from "./level1/ground-type";
import { Level2, Level2MapAndAssets } from "./level2/level2";
import { groundTypes as level2GroundTypes } from "./level2/ground-type";
import { Level3, Level3MapAndAssets } from "./level3/level3";
import { groundTypes as level3GroundTypes } from "./level3/ground-type";
import { Level4, Level4MapAndAssets } from "./level4/level4";
import { groundTypes as level4GroundTypes } from "./level4/ground-type";
import { withMapBuilder } from "./mixins/with-map-builder";
import { Level } from "./types/level";
import { Credits } from "./credits/credits";
import { TheEnd } from "./credits/the-end";

export default new Phaser.Game({
  type: Phaser.AUTO,
  width: "100%",
  height: "100%",
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
    withMapBuilder(Level3MapAndAssets, Level.Level3, level3GroundTypes),
    Level4,
    withMapBuilder(Level4MapAndAssets, Level.Level4, level4GroundTypes),
    Credits,
    TheEnd,
  ],
});
