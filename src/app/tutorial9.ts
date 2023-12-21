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

    this.physics.add.collider(this.player, this.platforms);

    //  Input Events
    this.cursors = this.input.keyboard!.createCursorKeys();

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    this.stars = this.physics.add.group({
      key: "star",
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: gameWidth / 12 },
    });

    this.stars.children.iterate((child: Phaser.GameObjects.GameObject) => {
      const sprite = child as Phaser.Physics.Arcade.Sprite;
      //  Give each star a slightly different bounce
      sprite.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      return true;
    });

    this.physics.add.collider(this.stars, this.platforms);

    this.physics.add.overlap(
      this.player,
      this.stars,
      (player, star) =>
        this.collectStar(
          player as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
          star as Phaser.Physics.Arcade.Sprite
        ),
      undefined,
      this
    );

    //  The score
    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "32px",
    });

    this.bombs = this.physics.add.group();

    this.physics.add.collider(this.bombs, this.platforms);

    this.physics.add.collider(
      this.player,
      this.bombs,
      (player) =>
        this.hitBomb(
          player as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
        ),
      undefined,
      this
    );
  }

  update() {
    if (this.gameOver) {
      return;
    }
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);

      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);

      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);

      this.player.anims.play("turn");
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
  }

  collectStar(
    player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
    star: Phaser.Physics.Arcade.Sprite
  ) {
    star.disableBody(true, true);

    //  Add and update the score
    this.score += 10;
    this.scoreText.setText("Score: " + this.score);

    if (this.stars.countActive(true) === 0) {
      //  A new batch of stars to collect
      this.stars.children.iterate((child) => {
        const sprite = child as Phaser.Physics.Arcade.Sprite;
        sprite.enableBody(true, sprite.x, 0, true, true);
        return true;
      });

      const x =
        player.x < 400
          ? Phaser.Math.Between(400, 800)
          : Phaser.Math.Between(0, 400);

      const bomb = this.bombs.create(x, 16, "mine");
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
      bomb.allowGravity = false;
    }
  }

  hitBomb(player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play("turn");

    this.gameOver = true;
  }
}
