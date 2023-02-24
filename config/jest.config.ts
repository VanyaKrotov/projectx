import { Config } from "jest";

export default {
  preset: "ts-jest",
  rootDir: "../",
  modulePaths: ["packages"],
  testPathIgnorePatterns: ["packages/projectx/*", "packages/projectx-react/*"],
  moduleDirectories: ["node_modules"],
} as Config;
