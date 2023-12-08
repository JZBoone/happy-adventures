import { Coordinates } from "../types/maps";
import { Movable } from "./movable";

export class Friend extends Movable<Phaser.GameObjects.Image> {
  mount: Movable<Phaser.GameObjects.Sprite> | null = null;

  disappear(): Promise<void> {
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.phaserObject,
        scaleX: 0, // Scale horizontally to 0
        scaleY: 0, // Scale vertically to 0
        ease: "Linear", // Use a linear easing
        duration: 2000, // Duration of the tween in milliseconds
        onComplete: () => {
          this.phaserObject.setVisible(false); // Hide the sprite after scaling down
          resolve();
        },
      });
    });
  }

  mountSprite(
    movable: Movable<Phaser.GameObjects.Sprite>,
    coordinates: Coordinates
  ) {
    this.phaserObject.setVisible(false);
    this.mount = movable;
    this.mount.move(coordinates);
  }

  unmountSprite(): Movable<Phaser.GameObjects.Sprite> {
    if (!this.mount) {
      throw new Error("Cannot unmount sprite because it is not mounted");
    }
    const mount = this.mount;
    this.mount = null;
    this.phaserObject.setVisible(true);
    return mount;
  }

  async move(
    coordinates: Coordinates,
    options: { noAnimation?: boolean } = {}
  ): Promise<void> {
    if (!this.mount) {
      return super.move(coordinates, options);
    }
    return this.mount.move(coordinates, options);
  }

  coordinates() {
    if (this.mount) {
      return this.mount.coordinates();
    }
    return super.coordinates();
  }

  isMoving(): boolean {
    if (!this.mount) {
      return super.isMoving();
    }
    return this.mount.isMoving();
  }
}
