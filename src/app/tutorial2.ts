import Phaser from "phaser";

export class Tutorial extends Phaser.Scene {
  bombs!: Phaser.Physics.Arcade.Group;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  gameOver = false;
  platforms!: Phaser.Physics.Arcade.StaticGroup;
  player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  score = 0;
  scoreText!: Phaser.GameObjects.Text;
  stars!: Phaser.Physics.Arcade.Group;

  preload() {
    this.load.image("sky", "assets/image/sky.png");
    this.load.image("ground", "assets/image/platform.png");
    this.load.image("star", "assets/image/star.png");
    this.load.image("mine", "assets/image/mine.png");
    this.load.spritesheet("dude", "assets/image/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    // create the sky
    this.add.image(gameWidth / 2, gameHeight / 2, "sky");
  }

  update() {}
}
