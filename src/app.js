const express = require("express");
const path = require("path");
const app = express();
const port = process.env.port || 3000;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "favicon.ico"));
});

app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/lib", express.static(path.join(__dirname, "../node_modules")));

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
