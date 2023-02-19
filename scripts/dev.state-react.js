const esbuild = require("esbuild");
const path = require("path");

const { getConfig } = require("../config/esbuild.config");
const { runServer } = require("./server");

const PATH = "../packages/state-react";

esbuild
  .context(
    getConfig({
      path: path.resolve(__dirname, PATH),
      entryPoints: [path.resolve(__dirname, PATH, "examples/index.tsx")],
    })
  )
  .then((ctx) => ctx.watch())
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .then(() =>
    runServer({
      outDir: "dist",
    })
  );
