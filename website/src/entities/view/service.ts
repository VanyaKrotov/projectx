import { di } from "shared/constants";

import { DocData, ViewData, ViewServiceInstance } from "./types";
import { ViewApi } from "./api";
import { AxiosError } from "axios";

class ViewService implements ViewServiceInstance {
  private readonly api = di.injectSync(ViewApi)!;

  public async loadData(): Promise<ViewData> {
    try {
      const { data } = await this.api.loadData();

      return data;
    } catch (error) {
      throw new Error(JSON.stringify((error as AxiosError).response?.data));
    }
  }

  public async loadDocsForLib(libName: string): Promise<DocData> {
    try {
      const { data } = await this.api.loadDocsForLib(libName);

      return data;
    } catch (error) {
      throw new Error(JSON.stringify((error as AxiosError).response?.data));
    }
  }
}

di.register(ViewService);

export { ViewService };
