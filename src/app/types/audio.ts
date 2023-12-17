export enum AudioAsset {
  BoardBoat = "board-boat",
  CastleOpen = "door-open",
  Chomp = "chomp",
  Crunch = "crunch",
  Explosion = "explosion",
  Fall = "fall",
  Grunt = "grunt",
  Motor = "motor",
  SandStep = "sand-step",
  Splash = "splash",
  Splat = "splat",
  Stomp = "stomp",
  Tada = "tada",
  Thump = "thump",
  Whoosh = "whoosh",
}

export const defaultAudio = [AudioAsset.Thump, AudioAsset.Tada] as const;
export type DefaultAudioAsset = (typeof defaultAudio)[number];
