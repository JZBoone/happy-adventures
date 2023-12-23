import Phaser from "phaser";
import { Level1 } from "./level1/level1";
import { Level1MapAndAssets } from "./level1/level1-assets";
import { Level2 } from "./level2/level2";
import { Level2MapAndAssets } from "./level2/level2-assets";
import { Level3 } from "./level3/level3";
import { Level3MapAndAssets } from "./level3/level3-assets";
import { Level4 } from "./level4/level4";
import { Level4MapAndAssets } from "./level4/level4-assets";
import { withMapBuilder } from "./mixins/with-map-builder";
import { Level } from "./types/level";
import { Credits } from "./credits/credits";
import { TheEnd } from "./credits/the-end";
import { Level5 } from "./level5/level5";
import { Level5MapAndAssets } from "./level5/level5-assets";

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
    withMapBuilder(Level1MapAndAssets, Level.Level1),
    Level2,
    withMapBuilder(Level2MapAndAssets, Level.Level2),
    Level3,
    withMapBuilder(Level3MapAndAssets, Level.Level3),
    Level4,
    withMapBuilder(Level4MapAndAssets, Level.Level4),
    Level5,
    withMapBuilder(Level5MapAndAssets, Level.Level5),
    Credits,
    TheEnd,
  ],
});
