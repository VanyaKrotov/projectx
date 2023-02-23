import State from "projectx.state";
import { di } from "shared/constants";

import { ViewService } from "./service";
import { Themes, ViewData } from "./types";

interface ViewStateData {
  loading: boolean;
  data: ViewData | null;
  error: string | null;
  theme: Themes;
}

class ViewState extends State<ViewStateData> {
  public data: ViewStateData = {
    data: null,
    error: null,
    loading: true,
    theme: "dark",
  };

  readonly service = di.inject(ViewService)!;

  public toggleTheme() {
    this.change({ theme: this.data.theme === "dark" ? "light" : "dark" });
  }

  public async loadData() {
    this.change({ loading: true, error: null });

    try {
      const data = await this.service.loadData();

      this.change({ data, loading: false });
    } catch (error) {
      this.change({ error: (error as Error).message, loading: false });
    }
  }
}

export default ViewState;
