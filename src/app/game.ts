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
import { Scene } from "./types/scene";
import { Credits } from "./credits/credits";
import { TheEnd } from "./credits/the-end";
import { Level5 } from "./level5/level5";
import { Level5MapAndAssets } from "./level5/level5-assets";
import { PlayerSelection } from "./player-selection/player-selection";
import { Level6 } from "./level6/level6";
import { Level6MapAndAssets } from "./level6/level6-assets";

export default new Phaser.Game({
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scale: {
    mode: Phaser.Scale.RESIZE,
  },
  scene: [
    PlayerSelection,
    Level1,
    withMapBuilder(Level1MapAndAssets, Scene.Level1, Level1),
    Level2,
    withMapBuilder(Level2MapAndAssets, Scene.Level2, Level2),
    Level3,
    withMapBuilder(Level3MapAndAssets, Scene.Level3, Level3),
    Level4,
    withMapBuilder(Level4MapAndAssets, Scene.Level4, Level4),
    Level5,
    withMapBuilder(Level5MapAndAssets, Scene.Level5, Level5),
    Level6,
    withMapBuilder(Level6MapAndAssets, Scene.Level6, Level6),
    Credits,
    TheEnd,
  ],
});
