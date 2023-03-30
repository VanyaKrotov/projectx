import { createBatchManager } from "./batch";
import { createInterceptor } from "./interceptor";

export const interceptor = createInterceptor();

export const batch = createBatchManager();
