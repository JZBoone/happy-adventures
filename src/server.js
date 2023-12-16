const { writeFileSync } = require("fs");
const express = require("express");
const { join } = require("path");
const app = express();
const esbuild = require("esbuild");
const prettier = require("prettier");

const { esbuildConfig } = require("../esbuild.config");

const port = process.env.port || 3000;

app.use(express.json());

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
app.post("/map/:level", async (req, res) => {
  const level = req.params.level;
  if (!level || !level.startsWith("level")) {
    return res.status(400).send({ message: "Invalid level" });
  }
  const { map, mapObjects } = req.body;
  if (!Array.isArray(map) || !Array.isArray(map[0])) {
    return res.status(400).send({ message: "Invalid map" });
  }
  writeFileSync(
    join(__dirname, `./assets/map/${level}.json`),
    await prettier.format(JSON.stringify(map), { parser: "json" })
  );
  writeFileSync(
    join(__dirname, `./assets/map/${level}-objects.json`),
    await prettier.format(JSON.stringify(mapObjects), { parser: "json" })
  );
  return res.status(200).send({ message: "success", map, mapObjects });
});

app.use("/assets", express.static(join(__dirname, "assets")));
app.use("/js", express.static(join(__dirname, "./js")));

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
