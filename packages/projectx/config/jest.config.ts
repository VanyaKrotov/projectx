import { Config } from "jest";

import { compilerOptions } from "../tsconfig.json";

function getModuleNameMapper(
  paths: Record<string, string[]>
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const path in paths) {
    result[`^${path.replace("/*", "(.*)")}$`] = paths[path][0]
      .replace("./", "<rootDir>")
      .replace("/*", "$1");
  }

  return result;
}

export default {
  preset: "ts-jest",
  rootDir: "../",
  modulePaths: ["src"],
  moduleDirectories: ["node_modules"],
  moduleNameMapper: getModuleNameMapper(compilerOptions.paths),
} as Config;
