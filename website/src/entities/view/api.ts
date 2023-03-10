import axios, { AxiosResponse } from "axios";
import { di, __DEV__ } from "shared/constants";
import { DocData, ViewApiInstance, ViewData } from "./types";

const REPO_PATH =
  "https://raw.githubusercontent.com/VanyaKrotov/projectx/main/website/assets/";

const instance = axios.create({
  baseURL: __DEV__ ? "http://localhost:3000/assets/" : REPO_PATH,
});

class ViewApi implements ViewApiInstance {
  private getFromGithub<T>(path: string): Promise<AxiosResponse<T>> {
    return instance.get(`data/${path}`);
  }

  public async loadData(): Promise<AxiosResponse<ViewData>> {
    return this.getFromGithub("index.json");
  }

  public async loadDocsForLib(
    libName: string
  ): Promise<AxiosResponse<DocData>> {
    return this.getFromGithub(`docs/${libName}.json`);
  }
}

di.register(ViewApi);

export { ViewApi };
