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

export function disappearFriend(
  scene: Phaser.Scene,
  friend: Phaser.GameObjects.Image
) {
  scene.tweens.add({
    targets: friend,
    scaleX: 0, // Scale horizontally to 0
    scaleY: 0, // Scale vertically to 0
    ease: "Linear", // Use a linear easing
    duration: 2000, // Duration of the tween in milliseconds
    onComplete: () => {
      friend.setVisible(false); // Hide the sprite after scaling down
    },
  });
}
