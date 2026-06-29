export enum AudioAsset {
  BoardBoat = "board-boat",
  CastleOpen = "door-open",
  Cheer = "cheer",
  Chomp = "chomp",
  Crunch = "crunch",
  EvilLaughter = "evil-laughter",
  Explosion = "explosion",
  Fall = "fall",
  FunnyCry = "funny-cry",
  Grunt = "grunt",
  LeverPull = "lever-pull",
  Motor = "motor",
  RockDestroy = "rock-destroy",
  SandStep = "sand-step",
  Sizzle = "sizzle",
  SparklingStar = "sparkling-star",
  Splash = "splash",
  Splat = "splat",
  Stomp = "stomp",
  SuccessBell = "success-bell",
  Tada = "tada",
  Thump = "thump",
  Twinkle = "twinkle",
  Whoosh = "whoosh",
}

export const defaultAudio = [AudioAsset.Thump, AudioAsset.Tada] as const;
export type DefaultAudioAsset = (typeof defaultAudio)[number];
