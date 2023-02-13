const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const { getConfig } = require("../config/website.config");
const { runServer } = require("./server");

esbuild
  .context(getConfig({}))
  .then((ctx) => ctx.watch())
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .then(runServer);
