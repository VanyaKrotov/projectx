import type { Configuration } from "../shared";

import { configuration } from "../components/initialize";

function configurations(config: Partial<Configuration>): void {
  configuration.change(config);
}

export { configurations };
