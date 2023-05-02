const { emptyDir, copy } = require("fs-extra");
const { build } = require("esbuild");
const path = require("path");
const { exec } = require("child_process");
const { state } = require("./paths");

const dist = path.resolve(state, "dist");
const tsconfig = path.resolve(state, "tsconfig.json");

const common = {
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
        "dev.esm": path.resolve(state, "src/index.ts"),
      },
      ...common,
      format: "esm",
      minify: false,
    });

    await build({
      entryPoints: {
        "production.esm": path.resolve(state, "src/index.ts"),
      },
      ...common,
      format: "esm",
      minify: true,
    });

    await build({
      entryPoints: {
        "dev.cjs": path.resolve(state, "src/index.ts"),
      },
      ...common,
      format: "cjs",
      minify: false,
    });

    await build({
      entryPoints: {
        "production.cjs": path.resolve(state, "src/index.ts"),
      },
      ...common,
      format: "cjs",
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
