const express = require("express");
const { join } = require("path");
const app = express();
const esbuild = require("esbuild");

const { esbuildConfig } = require("../esbuild.config");

const port = process.env.port || 3000;

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});
app.get("/favicon.ico", (req, res) => {
  res.sendFile(join(__dirname, "favicon.ico"));
});
app.get("/js/bundle.js", async (req, res) => {
  await esbuild.build(esbuildConfig);
  return res.sendFile(join(__dirname, "./js/bundle.js"));
});

app.use("/assets", express.static(join(__dirname, "assets")));
app.use("/js", express.static(join(__dirname, "./dist")));

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
