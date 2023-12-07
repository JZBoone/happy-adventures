module.exports.esbuildConfig = {
  entryPoints: ["./src/app/game.ts"],
  bundle: true,
  minify: true,
  outfile: "./src/js/bundle.js",
  sourcemap: true,
  platform: "browser",
  target: ["chrome118"],
};
