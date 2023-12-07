import Phaser from "phaser";

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
