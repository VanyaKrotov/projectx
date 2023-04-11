const path = require("path");

const root = path.resolve(__dirname, "..");
const packages = path.resolve(root, "packages");

module.exports = {
  root,
  packages,
  state: path.resolve(packages, "state"),
};
