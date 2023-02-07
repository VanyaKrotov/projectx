const path = require("path");

const { name } = require("../package.json");

const ENTRY_POINTS = {
  development: ["./src/dev.js"],
  production: ["./src/index.js"],
};

function getConfig({ mode = 'development', minify = false }) {
  const isDevelopment = mode === "development";
  const outDir = isDevelopment ? "dist" : "build";

  return {
    entryPoints: ENTRY_POINTS[mode],
    outfile: `${outDir}/${name}${minify ? ".min" : ""}.js`,
    target: "es2015",
    bundle: true,
    sourcemap: isDevelopment,
    minify,
    tsconfig: path.resolve(__dirname, "../tsconfig.json"),
  };
}

module.exports = {
  getConfig,
};
