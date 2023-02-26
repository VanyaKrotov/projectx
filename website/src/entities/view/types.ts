import { AxiosResponse } from "axios";

export type Themes = "light" | "dark";

export interface ViewApiInstance {
  loadData(): Promise<AxiosResponse<ViewData>>;
  loadDocsForLib(libName: string): Promise<AxiosResponse<DocData>>;
}

export interface ViewServiceInstance {
  loadData(): Promise<ViewData>;
  loadDocsForLib(libName: string): Promise<DocData>;
}

export interface Version {
  date: string;
  version: string;
}

export interface Doc {
  version: string;
}

export interface ViewData {
  packages: {
    [key: string]: {
      versions: Version[];
      docs: Doc[];
    };
  };
}

export interface DocSection {
  path: string;
}

export interface DocData {
  version: string;
  sections: {
    [key: string]: DocSection;
  };
}
