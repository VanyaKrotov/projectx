import { Configuration, ConfigurationManagerInstance } from "../shared/types";

const DEFAULT: Configuration = {
  equalResolver: (a, b) => a === b,
};

class ConfigurationManager implements ConfigurationManagerInstance {
  private configurations: Configuration = DEFAULT;

  public get config(): Configuration {
    return this.configurations;
  }

  public reset(): void {
    this.configurations = DEFAULT;
  }

  public change(config: Partial<Configuration>): void {
    this.configurations = {
      ...this.configurations,
      ...config,
    };
  }
}

export default ConfigurationManager;
