const { emptyDir, copy } = require("fs-extra");
const { build } = require("esbuild");
const path = require("path");
const { exec } = require("child_process");
const { state } = require("./paths");

const dist = path.resolve(state, "dist");
const tsconfig = path.resolve(state, "tsconfig.json");

const common = {
  format: "esm",
  tsconfig,
  outdir: dist,
  bundle: true,
  sourcemap: true,
};

async function main() {
  await emptyDir(dist);
  await copy(path.resolve(state, "public"), dist, { overwrite: true });

  try {
    await build({
      entryPoints: {
        dev: path.resolve(state, "src/index.ts"),
      },
      ...common,
      minify: false,
    });

    await build({
      entryPoints: {
        production: path.resolve(state, "src/index.ts"),
      },
      ...common,
      minify: true,
    });

    const ts = path.join("packages", "state", "tsconfig.json");

    await exec(`tsc --project ${ts} --emitDeclarationOnly`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
