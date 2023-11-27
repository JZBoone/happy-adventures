const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["./src/app/game.ts"],
    bundle: true,
    outfile: "./src/dist/bundle.js",
    sourcemap: true,
    platform: "browser",
    target: ["chrome118"],
  })
  .catch(() => process.exit(1));
