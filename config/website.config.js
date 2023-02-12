const path = require("path");
const { sassPlugin } = require("esbuild-sass-plugin");

function getConfig({ mode = "development", minify = false }) {
  const { name, version, main } = require(`../website/package.json`);

  const isDevelopment = mode === "development";
  const versionPostfix = isDevelopment ? "" : `.v${version}`;
  const outfile = isDevelopment
    ? `dist/index.js`
    : `build/${name}${minify ? ".min" : ""}${versionPostfix}.js`;

  return {
    entryPoints: [path.resolve(__dirname, `../website/${main}`)],
    outfile,
    target: "es2015",
    bundle: true,
    sourcemap: isDevelopment,
    minify,
    tsconfig: path.resolve(__dirname, "../website/tsconfig.json"),
    plugins: [
      sassPlugin({
        type: "style",
      }),
    ],
  };
}

module.exports = {
  getConfig,
};
