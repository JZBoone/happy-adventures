import { AudioAsset } from "../types/audio";
import { ImageAsset } from "../types/image";
import { ISceneWithMap } from "../types/map";
import { SpriteAsset } from "../types/sprite";
import { Immovable, ImmovableOptions } from "./immovable";
import { mapTileSizePx } from "./map";

export class Interactable<
  SceneAudioAsset extends AudioAsset,
  SceneImageAsset extends ImageAsset,
  SceneSpriteAsset extends SpriteAsset,
  SceneImmovableImages extends Record<string, { asset: SceneImageAsset }>,
  SceneImmovableImageGroups extends Record<string, { asset: SceneImageAsset }>,
  SceneImmovableSprites extends Record<string, { asset: SceneSpriteAsset }>,
  SceneMovableImages extends Record<string, { asset: SceneImageAsset }>,
  SceneMovableSprites extends Record<string, { asset: SceneSpriteAsset }>,
> extends Immovable<Phaser.GameObjects.Image> {
  message: string;
  private bubbleText?: {
    bubble: Phaser.GameObjects.Graphics;
    text: Phaser.GameObjects.Text;
  };
  constructor(
    public scene: ISceneWithMap<
      SceneAudioAsset,
      SceneImageAsset,
      SceneSpriteAsset,
      SceneImmovableImages,
      SceneImmovableImageGroups,
      SceneImmovableSprites,
      SceneMovableImages,
      SceneMovableSprites
    >,
    public phaserObject: InstanceType<typeof Phaser.GameObjects.Image>,
    options: ImmovableOptions & { message: string }
  ) {
    super(phaserObject, options);
    this.message = options.message;
    scene.moves$.subscribe(({ coordinates }) => {
      if (this.isAdjacentTo(coordinates)) {
        this.interact();
      } else {
        if (this.bubbleText) {
          this.bubbleText.bubble.destroy();
          this.bubbleText.text.destroy();
          this.bubbleText = undefined;
        }
      }
    });
  }

  interact() {
    if (this.bubbleText) {
      return;
    }
    const height = 125;
    const width = 250;
    const bubble = this.scene.add.graphics({
      x: this.phaserObject.x + mapTileSizePx / 2,
      y: this.phaserObject.y - mapTileSizePx / 2 - height - 5,
    });

    bubble.fillStyle(0x000000, 0.5);
    bubble.lineStyle(4, 0x565656, 1);

    const radius = 5;
    bubble.strokeRoundedRect(0, 0, width, height, radius);
    bubble.fillRoundedRect(0, 0, width, height, radius);
    const text = this.scene.add.text(
      bubble.x + 10,
      bubble.y + 10,
      this.message,
      {
        font: "20px Arial",
        wordWrap: { width: width - 10 },
      }
    );

    this.bubbleText = { bubble, text };
  }
}
