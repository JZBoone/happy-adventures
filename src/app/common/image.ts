import Phaser from "phaser";

export enum ImageAsset {
  Boat = "boat",
  Mine = "mine",
  Cloud = "cloud",
  Grass = "grass",
  Heart = "heart",
  Bomb = "bomb",
  Platform = "platform",
  Sand = "sand",
  Sky = "sky",
  Star = "star",
  Water = "water",
  Stone = "stone",
  BlackHole = "black-hole",
  Monster = "monster",
  Portal = "portal",
  Goo = "goo",
  Lungs = "lungs",
  Elasmosaurus = "elasmosaurus",
  SmallElasmosaurus = "small-elasmosaurus",
  Bones = "bones",
  Forest = "forest",
  Friend = "friend",
  Tree = "tree",
  MagicTree = "magic-tree",
  Cactus = "cactus",
  BoobyTrap = "booby-trap",
  ThreeSpikes = "three-spikes",
  MountainSpikes = "mountain-spikes",
  SpikeBench = "spike-bench",
  SquareSpike = "square-spike",
}

export function loadImages(scene: Phaser.Scene, assets: readonly ImageAsset[]) {
  for (const asset of assets) {
    scene.load.image(asset, `assets/image/${asset}.png`);
  }
}
