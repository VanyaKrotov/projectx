const path = require("path");

const { name, version } = require("../package.json");

const ENTRY_POINTS = {
  development: ["./src/dev.js"],
  production: ["./src/index.js"],
};

function getConfig({ mode = "development", minify = false }) {
  const isDevelopment = mode === "development";
  const versionPOstfix = isDevelopment ? "" : `.v${version}`;
  const outfile = isDevelopment
    ? `dist/index.js`
    : `build/${name}${minify ? ".min" : ""}${versionPOstfix}.js`;

  return {
    entryPoints: ENTRY_POINTS[mode],
    outfile,
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
