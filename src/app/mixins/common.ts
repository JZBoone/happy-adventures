export type Constructor<T = {}> = new (...args: any[]) => T;

export type SceneClass = Constructor<Phaser.Scene>;
