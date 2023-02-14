const path = require("path");
const { sassPlugin } = require("esbuild-sass-plugin");
const svgrPlugin = require("esbuild-plugin-svgr");

function getConfig({ mode = "development", minify = false }) {
  const { name, version, main } = require("../package.json");

  const isDevelopment = mode === "development";
  const versionPostfix = isDevelopment ? "" : `.v${version}`;
  const outfile = isDevelopment
    ? `dist/index.js`
    : `build/${name}${minify ? ".min" : ""}${versionPostfix}.js`;

  return {
    entryPoints: [path.resolve(__dirname, `../${main}`)],
    outfile,
    target: "es2015",
    bundle: true,
    sourcemap: isDevelopment,
    minify,
    tsconfig: path.resolve(__dirname, "../tsconfig.json"),
    plugins: [
      svgrPlugin(),
      sassPlugin({
        type: "style",
      }),
    ],
  };
}

module.exports = {
  getConfig,
};
