import Phaser from "phaser";

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
}

export function loadAudio(scene: Phaser.Scene, assets: readonly AudioAsset[]) {
  for (const asset of assets) {
    scene.load.audio(asset, `${process.env.API_URL}/assets/audio/${asset}.mp3`);
  }
}
