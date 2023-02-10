import { ManagerInstance, ReactionInstance } from "../shared/types";
import { __DEV__ } from "../shared/constants";

import Batch from "../components/batch";
import Interceptor from "../components/interceptor";
import ConfigurationManager from "../components/configuration-manager";

export const interceptor = new Interceptor();

export const batch = new Batch();

export const managers = new Map<string, ManagerInstance>();

export const reactions = new Map<string, ReactionInstance>();

export const configuration = new ConfigurationManager();

if (__DEV__) {
  console.log("ProjectX data: ", { interceptor, batch, managers, reactions });
}
