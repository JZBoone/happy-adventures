import Phaser from "phaser";
import { Level1 } from "./level1/level1";
import { Level2 } from "./level2/level2";
import { Level3 } from "./level3/level3";

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
  scene: [Level3, Level1, Level2],
});
