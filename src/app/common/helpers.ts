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

export function createEditableDialog(
  scene: Phaser.Scene,
  defaultText: string,
  onSave: (message: string) => void,
  onCancel: () => void
) {
  const x = scene.cameras.main.width / 2;
  const y = scene.cameras.main.height / 2;

  // Create a container for the dialog
  const dialog = scene.add.container(x, y).setDepth(100).setScrollFactor(0);

  // Create a background rectangle
  const background = scene.add.rectangle(0, 0, 400, 150, 0x000000, 0.8);
  dialog.add(background);

  // Positioning the dialog
  background.setOrigin(0.5, 0.5);

  // Create an HTML input element
  const inputElement = document.createElement("textarea");
  inputElement.style.position = "absolute";
  inputElement.value = defaultText;
  inputElement.style.left = `${scene.game.canvas.offsetLeft + x - 175}px`;
  inputElement.style.top = `${scene.game.canvas.offsetTop + y - 50}px`;
  inputElement.style.width = "350px";
  inputElement.style.height = "75px";

  document.body.appendChild(inputElement);

  // Focus the input element
  inputElement.focus();

  inputElement.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      onSave(inputElement.value);
      cleanup();
    }
  });

  const onEscapeKeyup = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setTimeout(() => {
        onCancel();
        cleanup();
      }, 0);
    }
  };
  document.addEventListener("keyup", onEscapeKeyup);

  // Cleanup function
  function cleanup() {
    inputElement.remove();
    dialog.destroy();
    document.removeEventListener("keyup", onEscapeKeyup);
  }
}
