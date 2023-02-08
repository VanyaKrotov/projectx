const esbuild = require("esbuild");

const { getConfig } = require("../config/esbuild.config");

esbuild.build(getConfig({ mode: "production", minify: true }));

esbuild.build(getConfig({ mode: "production" }));
