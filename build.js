const esbuild = require("esbuild");
const { esbuildConfig } = require("./esbuild.config");
const { join } = require("path");
const fs = require("fs");

const distDir = join(__dirname, "dist");
const jsDistDir = join(distDir, "./js");

if (!fs.existsSync(jsDistDir)) {
  fs.mkdirSync(jsDistDir, { recursive: true });
}

esbuild
  .build({
    ...esbuildConfig,
    outfile:
      process.env.NODE_ENV === "production"
        ? join(jsDistDir, "./bundle.js")
        : "./src/js/bundle.js",
  })
  .then(() => {
    if (process.env.NODE_ENV === "production") {
      const htmlContent = fs.readFileSync("./src/index.html", "utf8");
      fs.writeFileSync(
        join(distDir, "./index.html"),
        htmlContent
          .replace("/js/bundle.js", `${process.env.API_URL}/js/bundle.js`)
          .replace("/favicon.ico", `${process.env.API_URL}/favicon.ico`)
      );

      fs.copyFileSync("./src/favicon.ico", join(distDir, "./favicon.ico"));
      fs.cpSync("./src/assets", join(distDir, "./assets"), {
        recursive: true,
        force: true,
      });
    }
    console.log("success!");
    process.exit(0);
  })
  .catch(() => process.exit(1));
