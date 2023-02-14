import type { Configuration } from "../shared";

import { configManager } from "../components/initialize";

function configuration(config: Partial<Configuration>): void {
  configManager.change(config);
}

export { configuration };
