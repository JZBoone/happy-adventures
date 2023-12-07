const esbuild = require("esbuild");
const { esbuildConfig } = require("./esbuild.config");

esbuild.build(esbuildConfig).catch(() => process.exit(1));
