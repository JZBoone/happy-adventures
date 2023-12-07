require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});

module.exports.esbuildConfig = {
  entryPoints: ["./src/app/game.ts"],
  bundle: true,
  minify: true,
  outfile: "./src/js/bundle.js",
  sourcemap: true,
  platform: "browser",
  target: ["chrome118"],
  define: {
    "process.env.API_URL": JSON.stringify(process.env.API_URL),
  },
};
