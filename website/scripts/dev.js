const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const { getConfig } = require("../config/website.config");
const { runServer } = require("../../scripts/server");

const COPY_FILES = ["index.html", "favicon.ico"];

esbuild
  .build({
    watch: true,
    ...getConfig({}),
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .then(() => {
    COPY_FILES.forEach((filename) => {
      fs.copyFile(
        path.resolve(__dirname, `../public/${filename}`),
        path.resolve(__dirname, `../dist/${filename}`),
        (error) => {
          if (error) {
            throw new Error(`Copy file error! ${error.message}`);
          }
        }
      );
    });

    return runServer(3000, "../website/dist");
  });

// esbuild.context().then((ctx) => ctx.watch());
