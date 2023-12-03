export enum AudioAsset {
  CastleOpen = "CastleOpen",
  SandStep = "SandStep",
  Splash = "Splash",
  Tada = "Tada",
  Thump = "Thump",
  Stomp = "Stomp",
}

export const AudioAssets: Record<AudioAsset, string> = {
  [AudioAsset.CastleOpen]: "assets/audio/door-open.mp3",
  [AudioAsset.SandStep]: "assets/audio/sand-step.mp3",
  [AudioAsset.Splash]: "assets/audio/splash.mp3",
  [AudioAsset.Tada]: "assets/audio/tada.mp3",
  [AudioAsset.Thump]: "assets/audio/thump.mp3",
  [AudioAsset.Stomp]: "assets/audio/stomp.mp3",
};
