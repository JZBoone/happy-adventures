require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});

module.exports.esbuildConfig = {
  entryPoints: ["./src/app/game.ts"],
  bundle: true,
  minify: process.env.NODE_ENV === "production" ? true : false,
  outfile: "./src/js/bundle.js",
  sourcemap: process.env.NODE_ENV !== "production" ? true : false,
  platform: "browser",
  target: ["chrome118"],
  define: {
    "process.env.API_URL": JSON.stringify(process.env.API_URL),
    "process.env.MAP_BUILDER_ENABLED": process.env.MAP_BUILDER_ENABLED,
  },
};
