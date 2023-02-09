import { Config } from "jest";

export default {
  preset: "ts-jest",
  rootDir: "../",
  modulePaths: ["packages"],
  moduleDirectories: ["node_modules"],
} as Config;
