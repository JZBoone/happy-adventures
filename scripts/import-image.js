/**
 * Import an image file into the game's asset folder as a PNG, resized to fit the
 * game's tile grid. Uses the `canvas` dependency already in the project (no extra deps).
 *
 * Usage:
 *   node scripts/import-image.js <src> <kebab-name> [--tile] [--max=WxH]
 *
 *   <src>         Path to any PNG/JPEG source image (any size).
 *   <kebab-name>  Output asset name, kebab-case. Writes src/assets/image/<name>.png
 *                 This is also the string value you add to the ImageAsset enum.
 *
 * Options (pick at most one sizing mode; default keeps the original size):
 *   --tile        Force exactly 50x50 (the ground-tile size, mapTileSizePx). Stretches to fill.
 *   --max=WxH     Scale down to fit within W x H, preserving aspect ratio (for objects/sprites).
 *                 e.g. --max=100x100. Never upscales past the source.
 *
 * Transparency is always preserved. Output is always PNG.
 *
 * Examples:
 *   node scripts/import-image.js ~/Downloads/lava.png lava --tile
 *   node scripts/import-image.js ~/Downloads/wizard.png wizard --max=60x100
 */

const { createCanvas, loadImage } = require("canvas");
const { writeFileSync, existsSync } = require("fs");
const { join } = require("path");

const TILE_SIZE = 50; // keep in sync with mapTileSizePx in src/app/common/map.ts
const OUTPUT_DIR = join(__dirname, "../src/assets/image");

function fail(message) {
  console.error(`Error: ${message}\n`);
  console.error(
    "Usage: node scripts/import-image.js <src> <kebab-name> [--tile] [--max=WxH]"
  );
  process.exit(1);
}

function parseArgs(argv) {
  const positional = [];
  let tile = false;
  let max = null;
  for (const arg of argv) {
    if (arg === "--tile") {
      tile = true;
    } else if (arg.startsWith("--max=")) {
      const m = arg.slice("--max=".length).match(/^(\d+)x(\d+)$/);
      if (!m) fail(`--max must look like --max=WxH (e.g. --max=100x100), got "${arg}"`);
      max = { w: Number(m[1]), h: Number(m[2]) };
    } else if (arg.startsWith("--")) {
      fail(`Unknown option "${arg}"`);
    } else {
      positional.push(arg);
    }
  }
  if (positional.length !== 2) fail("Expected exactly <src> and <kebab-name>.");
  if (tile && max) fail("Use either --tile or --max, not both.");
  const [src, name] = positional;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
    fail(`<kebab-name> must be kebab-case (e.g. "magic-tree"), got "${name}"`);
  }
  return { src, name, tile, max };
}

function targetSize(srcW, srcH, { tile, max }) {
  if (tile) return { w: TILE_SIZE, h: TILE_SIZE };
  if (max) {
    const scale = Math.min(max.w / srcW, max.h / srcH, 1); // never upscale
    return { w: Math.round(srcW * scale), h: Math.round(srcH * scale) };
  }
  return { w: srcW, h: srcH };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!existsSync(opts.src)) fail(`Source file not found: ${opts.src}`);

  const image = await loadImage(opts.src);
  const { w, h } = targetSize(image.width, image.height, opts);

  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, w, h); // preserve transparency
  ctx.drawImage(image, 0, 0, w, h);

  const outPath = join(OUTPUT_DIR, `${opts.name}.png`);
  if (existsSync(outPath)) {
    console.warn(`Note: overwriting existing ${opts.name}.png`);
  }
  writeFileSync(outPath, canvas.toBuffer("image/png"));

  console.log(
    `Wrote ${outPath} (${image.width}x${image.height} -> ${w}x${h}).`
  );
  console.log("\nNext steps:");
  console.log(
    `  1. Add to ImageAsset enum in src/app/types/image.ts:  <PascalName> = "${opts.name}",`
  );
  console.log(
    "  2. Reference it in the level's assetOptions.images (and mapOptions/groundTypes if it's a tile)."
  );
}

main().catch((err) => fail(err.message));
