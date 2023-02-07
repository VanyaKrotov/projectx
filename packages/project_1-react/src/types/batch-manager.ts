import { Admin } from ".";

interface BatchEvent {
  path: string[];
}

interface BatchListener {
  (event: BatchEvent): void;
}

interface OptimizationTreeInstance {
  optimizedAdmins(): Admin[];
}

export interface BatchManagerInstance {
  emit(event: BatchEvent): void;
  getCaptured<T>(fn: () => T): { result: T; variables: string[][] };
  register(listener: BatchListener): void;
  unregister(listener: BatchListener): void;
  optimizePaths(paths: string[][]): OptimizationTreeInstance;
}
