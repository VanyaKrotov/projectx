import { observable } from "projectx.store";

import ViewStore from "./store";

const viewStore = observable.fromObject(new ViewStore());

export { viewStore };
