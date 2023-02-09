const esbuild = require("esbuild");
const path = require("path");

const { getConfig } = require("../config/esbuild.config");
const { runServer } = require("./server");

const ENTRY_POINTS = {
  development: "src/dev.tsx",
  production: "src/index.ts",
};

const PATH = "../packages/projectx-react";

esbuild
  .context(
    getConfig({
      path: path.resolve(__dirname, PATH),
      entryPoints: ENTRY_POINTS,
    })
  )
  .then((ctx) => ctx.watch())
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .then(() => runServer());
