import { Configuration } from "../shared/types";

import { configuration } from "./initialize";

function configurations(config: Partial<Configuration>): void {
  configuration.change(config);
}

export { configurations };
