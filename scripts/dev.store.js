const esbuild = require("esbuild");
const path = require("path");

const { getConfig } = require("../config/esbuild.config");
const { runServer } = require("./server");

esbuild
  .context(
    getConfig({
      path: path.resolve(__dirname, "../packages/projectx"),
      entryPoints: [path.resolve(__dirname, "../examples/store/basic.ts")],
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
