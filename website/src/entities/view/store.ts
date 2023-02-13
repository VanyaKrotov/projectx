import axios from "axios";

import { Themes } from "./types";

interface Version {
  date: string;
  version: string;
}

interface ViewData {
  packages: {
    store: {
      versions: Version[];
    };
    "store-react": {
      versions: Version[];
    };
  };
}

class ViewStore {
  public theme: Themes = "dark";

  public data: ViewData | null = null;

  public toggleTheme() {
    this.theme = this.theme === "dark" ? "light" : "dark";
  }

  public async loadData() {
    try {
      // const response = await axios.get<ViewData>(
      //   "https://raw.githubusercontent.com/VanyaKrotov/projectx/main/website/assets/data/index.json"
      // );

      this.data = require("@/assets/data/index.json");
    } catch {}
  }
}

export default ViewStore;
