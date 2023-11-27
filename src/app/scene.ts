import Phaser from "phaser";

export class Scene extends Phaser.Scene {
  platforms!: Phaser.Physics.Arcade.StaticGroup;
  friend!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  stars!: Phaser.Physics.Arcade.Group;
  score = 0;
  scoreText!: Phaser.GameObjects.Text;
  gameOver = false;
  bombs!: Phaser.Physics.Arcade.Group;
  constructor() {
    super({ key: "scene" });
  }

  preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("cloud", "assets/cloud.png");
    this.load.image("ground", "assets/platform.png");
    this.load.image("star", "assets/star.png");
    this.load.image("bomb", "assets/bomb.png");
    this.load.spritesheet("friend", "assets/friend.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    this.add.image(400, 300, "sky");
    this.add.image(100, 100, "cloud");
    this.add.image(300, 80, "cloud");
    this.add.image(475, 150, "cloud");
    this.scoreText = this.add.text(16, 16, "score: 0", {
      fontSize: "32px",
    });

    this.platforms = this.physics.add.staticGroup();

    this.platforms.create(400, 568, "ground").setScale(2).refreshBody();

    this.platforms.create(600, 400, "ground");
    this.platforms.create(50, 250, "ground");
    this.platforms.create(750, 220, "ground");

    this.friend = this.physics.add.sprite(100, 350, "friend");
    this.friend.body.setGravityY(200);
    this.friend.setBounce(0.2);
    this.friend.setCollideWorldBounds(true);

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("friend", {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "friend", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("friend", {
        start: 5,
        end: 8,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.cursors = this.input.keyboard!.createCursorKeys();

    this.stars = this.physics.add.group({
      key: "star",
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });

    this.stars.children.iterate((child) => {
      const sprite = child as Phaser.Physics.Arcade.Sprite;
      sprite.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      return true;
    });

    this.bombs = this.physics.add.group();

    this.physics.add.collider(this.friend, this.platforms);
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.collider(this.bombs, this.platforms);
    this.physics.add.collider(
      this.friend,
      this.bombs,
      this.hitBomb as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.friend,
      this.stars,
      this.collectStar as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );
  }

  hitBomb(
    friend: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
    bomb: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    this.physics.pause();

    friend.setTint(0xff0000);

    friend.anims.play("turn");

    this.gameOver = true;
  }

  update() {
    if (this.gameOver) {
      return;
    }
    if (this.cursors.left.isDown) {
      this.friend.setVelocityX(-160);

      this.friend.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.friend.setVelocityX(160);

      this.friend.anims.play("right", true);
    } else {
      this.friend.setVelocityX(0);

      this.friend.anims.play("turn");
    }

    if (this.cursors.up.isDown && this.friend.body.touching.down) {
      this.friend.setVelocityY(-430);
    }
  }

  collectStar(
    friend: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
    star: Phaser.Physics.Arcade.Sprite
  ) {
    star.disableBody(true, true);
    this.score += 10;
    this.scoreText.setText("Score: " + this.score);
    if (this.stars.countActive(true) === 0) {
      this.stars.children.iterate((child) => {
        const sprite = child as Phaser.Physics.Arcade.Sprite;
        sprite.enableBody(true, sprite.x, 0, true, true);
        return true;
      });

      const x =
        friend.x < 400
          ? Phaser.Math.Between(400, 800)
          : Phaser.Math.Between(0, 400);

      const bomb = this.bombs.create(x, 16, "bomb");
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
  }
}
