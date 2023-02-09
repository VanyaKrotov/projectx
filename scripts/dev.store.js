const esbuild = require("esbuild");
const path = require("path");

const { getConfig } = require("../config/esbuild.config");
const { runServer } = require("./server");

const ENTRY_POINTS = {
  development: "src/dev.ts",
  production: "src/index.ts",
};

esbuild
  .context(
    getConfig({
      path: path.resolve(__dirname, "../packages/projectx"),
      entryPoints: ENTRY_POINTS,
    })
  )
  .then((ctx) => ctx.watch())
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .then(() => runServer());
