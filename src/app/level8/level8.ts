import { takeUntil, takeWhile } from "rxjs";
import { newPromiseLasting, showLevelStartText } from "../common/helpers";
import { AudioAsset } from "../types/audio";
import { ImageAsset } from "../types/image";
import { Coordinates } from "../types/map";
import { Scene } from "../types/scene";
import { LeverAnimation } from "../types/sprite";
import { GroundType, Level8MapAndAssets } from "./level8-assets";

export class Level8 extends Level8MapAndAssets {
  private didWin = false;
  private readonly entrance: Coordinates = [1, 1];
  // Where the monster lurks between meals, read from the map on create.
  private monsterHome: Coordinates = [9, 17];

  constructor() {
    super({ key: Scene.Level8 });
  }

  async create() {
    await super.create();
    this.didWin = false;
    showLevelStartText(this, 8);
    this.createFriend({ coordinates: this.entrance });
    this.monsterHome = this.movableImages.swampMonster.coordinates();
    this.moves$
      .pipe(
        takeWhile(() => !this.didWin),
        takeUntil(this.shutdown$),
      )
      .subscribe(({ coordinates, groundType }) =>
        this.handleMove(coordinates, groundType),
      );
  }

  private async handleMove(coordinates: Coordinates, groundType: GroundType) {
    // Reaching the lever sets off the dynamite and wins the level.
    if (this.immovableSprites.lever.occupies(coordinates)) {
      this.completeLevel(coordinates);
      return;
    }
    // The castle and the dynamite are solid.
    if (
      this.immovableSprites.goblinCastle.occupies(coordinates) ||
      this.immovableImages.dynamite.occupies(coordinates)
    ) {
      return;
    }
    switch (groundType) {
      case ImageAsset.Goo:
        // Slimy grass: safe to walk on.
        this.friend.move(coordinates);
        break;
      case ImageAsset.SwampWater:
        // Come near the swamp and the swamp monster eats you.
        await this.eatenByMonster(coordinates);
        break;
      case ImageAsset.Fungus:
        // The fungus is too thick to walk through: do nothing.
        break;
    }
  }

  private async eatenByMonster(coordinates: Coordinates) {
    this.movesDisabled = true;
    await this.friend.move(coordinates);
    // The monster lunges across the swamp... GULP.
    await this.movableImages.swampMonster.move(coordinates);
    this.playSound(AudioAsset.Chomp);
    await this.friend.disappear();
    this.movableImages.swampMonster.move(this.monsterHome, {
      noAnimation: true,
    });
    this.friend.move(this.entrance, { noAnimation: true });
    this.friend.phaserObject.setVisible(true);
    this.movesDisabled = false;
  }

  private async completeLevel(coordinates: Coordinates) {
    this.didWin = true;
    this.immovableSprites.lever.phaserObject.anims.play(LeverAnimation.Pull);
    await this.friend.move(coordinates);
    // Swing the camera over to the castle so the BOOM happens on screen.
    const castle = this.immovableSprites.goblinCastle.phaserObject;
    this.cameras.main.stopFollow();
    this.cameras.main.pan(castle.x, castle.y, 900, "Sine.easeInOut");
    await newPromiseLasting(this, 1_100, () => this.explodeCastle());
    this.playSound(AudioAsset.Cheer);
    // This is the last level, so head to the credits.
    await newPromiseLasting(this, 2_000, () => this.scene.start(Scene.Credits));
  }

  private explodeCastle(): Promise<void> {
    this.playSound(AudioAsset.Explosion);
    this.cameras.main.shake(600, 0.01);
    this.immovableImages.dynamite.phaserObject.setVisible(false);
    const castle = this.immovableSprites.goblinCastle.phaserObject;
    return new Promise((resolve) => {
      // The castle puffs up, then blasts apart into nothing.
      this.tweens.add({
        targets: castle,
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 150,
        yoyo: false,
        onComplete: () => {
          this.tweens.add({
            targets: castle,
            scaleX: 0,
            scaleY: 0,
            alpha: 0,
            angle: 25,
            ease: "Back.easeIn",
            duration: 500,
            onComplete: () => {
              castle.setVisible(false);
              resolve();
            },
          });
        },
      });
    });
  }
}
