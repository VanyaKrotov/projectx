const esbuild = require("esbuild");
const path = require("path");

const common = {
  entryPoints: ["./src/index.js"],
  target: "es2015",
  bundle: true,
  tsconfig: path.resolve(__dirname, "../tsconfig.json"),
};

esbuild.build({
  ...common,
  outfile: "build/storex.min.js",
  minify: true,
});

esbuild.build({
  ...common,
  outfile: "build/storex.js",
  sourcemap: true,
});
