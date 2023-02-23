import State from "projectx.state";
import { di } from "shared/constants";

import { DocData } from "entities/view/types";
import { ViewService } from "entities/view/service";

interface HomePageStateData {
  loading: boolean;
  error: string | null;
  data: DocData | null;
}

class HomeState extends State<HomePageStateData> {
  public data: HomePageStateData = {
    data: null,
    error: null,
    loading: true,
  };

  readonly viewService = di.inject(ViewService)!;

  public async loadData(lib: string) {
    this.change({ loading: true, error: null });

    try {
      const data = await this.viewService.loadDocsForLib(lib);

      this.change({ loading: false, data });
    } catch (error) {
      this.change({ error: (error as Error).message, loading: false });
    }
  }
}

export default HomeState;
