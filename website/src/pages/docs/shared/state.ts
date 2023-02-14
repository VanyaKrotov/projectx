import { di } from "shared/constants";
import { transaction } from "projectx.store";

import { DocData } from "entities/view/types";
import { ViewService } from "entities/view/service";

class HomePageState {
  public loading = true;
  public error: string | null = null;
  public data: DocData | null = null;

  readonly #viewService = di.injectSync(ViewService)!;

  public async loadData(lib: string) {
    transaction(() => {
      this.loading = true;
      this.error = null;
    });

    try {
      this.data = await this.#viewService.loadDocsForLib(lib);
    } catch (error) {
      this.error = (error as Error).message;
    }

    this.loading = false;
  }
}

export default HomePageState;
