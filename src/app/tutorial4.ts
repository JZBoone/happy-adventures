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

    this.platforms = this.physics.add.staticGroup();

    // Create the bottom platform
    const bottom = this.add.tileSprite(
      gameWidth / 2,
      gameHeight - 32 / 2,
      gameWidth,
      32,
      "ground"
    );
    this.platforms.add(bottom);

    this.platforms.create(600, gameHeight - 170, "ground");
    this.platforms.create(50, gameHeight - 340, "ground");
    this.platforms.create(650, gameHeight - 490, "ground");

    // The player and its settings
    this.player = this.physics.add.sprite(100, 450, "dude");

    //  Player physics properties. Give the little guy a slight bounce.
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });
  }

  update() {}
}
