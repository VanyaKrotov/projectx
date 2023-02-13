import type {
  ContainerManagerInstance,
  Path,
  ReactionInstance,
} from "../shared";

import Batch from "./batch";
import Interceptor from "./interceptor";
import ConfigurationManager from "./configuration-manager";

export const interceptor = new Interceptor();

export const batch = new Batch();

export const managers = new Map<Path, ContainerManagerInstance>();

export const reactions = new Map<string, ReactionInstance>();

export const configuration = new ConfigurationManager();

if (configuration.config.develop) {
  console.log("ProjectX data: ", {
    interceptor,
    batch,
    managers,
    reactions,
  });
}
