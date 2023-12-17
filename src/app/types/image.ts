export enum ImageAsset {
  BlackHole = "black-hole",
  Boat = "boat",
  Bomb = "bomb",
  Bones = "bones",
  BoobyTrap = "booby-trap",
  Cactus = "cactus",
  Cloud = "cloud",
  Elasmosaurus = "elasmosaurus",
  Forest = "forest",
  Friend = "friend",
  Goo = "goo",
  Grass = "grass",
  Heart = "heart",
  LandingPad = "landing-pad",
  LittleSister = "little-sister",
  Lungs = "lungs",
  MagicTree = "magic-tree",
  Mine = "mine",
  Monster = "monster",
  MonsterGuts = "monster-guts",
  MountainSpikes = "mountain-spikes",
  Platform = "platform",
  Portal = "portal",
  Queen = "queen",
  Sand = "sand",
  Sky = "sky",
  SmallElasmosaurus = "small-elasmosaurus",
  SpikeBench = "spike-bench",
  SpikyGuy = "spiky-guy",
  SquareSpike = "square-spike",
  Star = "star",
  Stone = "stone",
  ThreeSpikes = "three-spikes",
  Tree = "tree",
  Water = "water",
}

export const defaultImages = [ImageAsset.Friend] as const;
export type DefaultImageAsset = (typeof defaultImages)[number];
