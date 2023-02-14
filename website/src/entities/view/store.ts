import { transaction } from "projectx.store";
import { di } from "shared/constants";

import { ViewService } from "./service";
import { Themes, ViewData } from "./types";

class ViewStore {
  public theme: Themes = "dark";

  public loading = true;

  public data: ViewData | null = null;

  public error: string | null = null;

  readonly #service = di.injectSync(ViewService)!;

  public toggleTheme() {
    this.theme = this.theme === "dark" ? "light" : "dark";
  }

  public async loadData() {
    transaction(() => {
      this.loading = true;
      this.error = null;
    });

    try {
      this.data = await this.#service?.loadData();
    } catch (error) {
      this.error = (error as Error).message;
    }

    this.loading = false;
  }
}

export default ViewStore;
