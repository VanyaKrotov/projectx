import type { Configuration, ConfigurationManagerInstance } from "../shared";
import { Observer } from "./observer";

const DEFAULT: Configuration = {
  equalResolver: (a, b) => a === b,
  develop: false,
};

class ConfigurationManager
  extends Observer<Configuration>
  implements ConfigurationManagerInstance
{
  private configurations: Configuration = DEFAULT;

  public get config(): Configuration {
    return this.configurations;
  }

  public reset(): void {
    this.configurations = DEFAULT;
  }

  public change(config: Partial<Configuration>): void {
    const prev = { ...this.configurations };

    this.configurations = {
      ...this.configurations,
      ...config,
    };

    this.emit({ prev, current: this.configurations });
  }
}

export default ConfigurationManager;
