import Phaser from "phaser";

export function showLevelStartText(scene: Phaser.Scene, levelNumber: number) {
  const levelText = scene.add
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

export function toast(scene: Phaser.Scene, text: string, duration = 5000) {
  const x = scene.cameras.main.width / 2;
  const y = scene.cameras.main.height / 2;

  // Create a container for the toast
  const toast = scene.add.container(x, y).setDepth(100).setScrollFactor(0);
  // Create a background rectangle
  const background = scene.add.rectangle(0, 0, 200, 50, 0x000000, 0.7);
  toast.add(background);

  // Add text to the toast
  const toastText = scene.add.text(0, 0, text, {
    font: "16px Arial",
    align: "center",
  });
  toastText.setOrigin(0.5, 0.5);
  toast.add(toastText);

  // Positioning the toast
  background.setOrigin(0.5, 0.5);

  // Animation to fade out
  scene.tweens.add({
    targets: toast,
    alpha: 0,
    ease: "Cubic.easeOut",
    duration: 300,
    delay: duration,
    onComplete: () => {
      toast.destroy();
    },
  });
}
