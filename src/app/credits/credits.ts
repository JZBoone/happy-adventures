import Phaser from "phaser";
import { Scene } from "../types/scene";

export class Credits extends Phaser.Scene {
  constructor() {
    super({ key: Scene.Credits });
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const creditsText = `Thank you for playing\nHappy Adventures\nby James Boone`;

    const credits = this.add
      .text(centerX, centerY + 100, creditsText, {
        font: "36px Arial",
        align: "center",
      })
      .setOrigin(0.5, 0.5);

    // Scroll the credits up
    this.tweens.add({
      targets: credits,
      y: 0, // Adjust depending on the length of the credits
      ease: "Linear",
      duration: 12_000,
      onComplete: () => {
        this.scene.start(Scene.TheEnd);
      },
    });
  }
}
