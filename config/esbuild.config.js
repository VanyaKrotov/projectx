function getConfig({
  mode = "development",
  minify = false,
  path = "..",
  entryPoints,
}) {
  const { name, version } = require(`${path}/package.json`);

  const isDevelopment = mode === "development";
  const versionPOstfix = isDevelopment ? "" : `.v${version}`;
  const outfile = isDevelopment
    ? `dist/index.js`
    : `build/${name}${minify ? ".min" : ""}${versionPOstfix}.js`;

  return {
    entryPoints: [`${path}/${entryPoints[mode]}`],
    outfile,
    target: "es2015",
    bundle: true,
    sourcemap: isDevelopment,
    minify,
    tsconfig: `${path}/tsconfig.json`,
  };
}

module.exports = {
  getConfig,
};
