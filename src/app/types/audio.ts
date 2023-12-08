export enum AudioAsset {
  BoardBoat = "board-boat",
  Chomp = "chomp",
  Crunch = "crunch",
  CastleOpen = "door-open",
  Explosion = "explosion",
  Fall = "fall",
  Grunt = "grunt",
  SandStep = "sand-step",
  Splash = "splash",
  Splat = "splat",
  Stomp = "stomp",
  Tada = "tada",
  Thump = "thump",
  Motor = "motor",
}

export const defaultAudio = [AudioAsset.Thump, AudioAsset.Tada] as const;
export type DefaultAudioAsset = (typeof defaultAudio)[number];
