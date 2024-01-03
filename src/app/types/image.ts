export enum ImageAsset {
  ArrowKeys = "arrow-keys",
  BlackHole = "black-hole",
  Boat = "boat",
  Bomb = "bomb",
  Bones = "bones",
  BoobyTrap = "booby-trap",
  Cactus = "cactus",
  Cloud = "cloud",
  CrackedRainbowGlitter = "cracked-rainbow-glitter",
  CuteSpider = "cute-spider",
  Elasmosaurus = "elasmosaurus",
  EvilGuy = "evil-guy",
  Forest = "forest",
  Friend = "friend",
  Goo = "goo",
  Grass = "grass",
  GumDrop = "gum-drop",
  Heart = "heart",
  LandingPad = "landing-pad",
  LittleSister = "little-sister",
  Lollipop = "lollipop",
  Lungs = "lungs",
  MagicalCraft = "magical-craft",
  MagicLollipopKey = "magic-lollipop-key",
  MagicTree = "magic-tree",
  Mine = "mine",
  Monster = "monster",
  MonsterGuts = "monster-guts",
  MountainSpikes = "mountain-spikes",
  NiceOldLady = "nice-old-lady",
  OompaBall = "oompa-ball",
  Peppermint = "peppermint",
  Platform = "platform",
  Portal = "portal",
  PurpleAcid = "purple-acid",
  Queen = "queen",
  RainbowGlitter = "rainbow-glitter",
  Sand = "sand",
  SandUp = "sand-up",
  SandDown = "sand-down",
  SandLeft = "sand-left",
  SandRight = "sand-right",
  Sky = "sky",
  SmallElasmosaurus = "small-elasmosaurus",
  SpikeBench = "spike-bench",
  SpikyGuy = "spiky-guy",
  SquareSpike = "square-spike",
  Star = "star",
  Stone = "stone",
  ThreeSpikes = "three-spikes",
  ToddieTitan = "toddie-titan",
  Tree = "tree",
  Water = "water",
}

export const defaultImages = [
  ImageAsset.Friend,
  ImageAsset.CuteSpider,
  ImageAsset.OompaBall,
  ImageAsset.ToddieTitan,
] as const;
export type DefaultImageAsset = (typeof defaultImages)[number];
