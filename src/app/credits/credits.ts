import Phaser from "phaser";
import { Scene } from "../types/scene";

export class Credits extends Phaser.Scene {
  constructor() {
    super({ key: Scene.Credits });
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const creditsStartY = centerY + 400;
    const credits = this.add
      .text(centerX, creditsStartY, this.creditsText(), {
        font: "36px Arial",
        align: "center",
      })
      .setOrigin(0.5, 0.5);

    const distanceY = creditsStartY + credits.height;
    const speed = 0.05;
    const duration = distanceY / speed;

    this.tweens.add({
      targets: credits,
      y: (-1 * credits.height) / 2, // Adjust depending on the length of the credits
      ease: "Linear",
      duration,
      onComplete: () => {
        this.scene.start(Scene.TheEnd);
      },
    });
  }

  private creditsText(): string {
    const lineBreak = Symbol("lineBreak");
    const textItems: (string | typeof lineBreak)[] = [
      "Thank you for playing",
      "Happy Adventures",
      lineBreak,
      lineBreak,
      lineBreak,
      "Designers",
      "James Boone",
      "Boone Stern",
      lineBreak,
      "Testers",
      "Levi Boone",
      lineBreak,
      "Developers",
      "Zach Boone",
    ];
    let text = "";
    textItems.forEach((textItem, i) => {
      if (textItem === lineBreak) {
        text += "\n";
      } else {
        text += `${textItem}`;
        if (i !== textItems.length - 1) {
          text += "\n";
        }
      }
    });
    return text;
  }
}
