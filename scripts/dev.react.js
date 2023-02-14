const esbuild = require("esbuild");
const path = require("path");

const { getConfig } = require("../config/esbuild.config");
const { runServer } = require("./server");

const PATH = "../packages/projectx-react";

esbuild
  .context(
    getConfig({
      path: path.resolve(__dirname, PATH),
      entryPoints: [path.resolve(__dirname, PATH, "src/index.dev.tsx")],
    })
  )
  .then((ctx) => ctx.watch())
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .then(() => runServer());
