import { ObserverInstance } from "./observer";
import { BatchManagerInstance } from "./batch-manager";

export interface Admin<T = any> extends ObserverInstance<any> {
  target: T;
  admins: Record<string, Admin>;
  get value(): T;
  get id(): string;
  get keys(): string[];
  setValue(value: T): boolean;
  getAdmin(key: string | symbol): Admin | null;
}

interface RootAdminInstance {
  add(admin: Admin): void;
  get(id: string): Admin | null;
  getAdminByPath(path: string[]): Admin | null;
}

export interface WindowStorex {
  batchManager: BatchManagerInstance;
  rootAdmin: RootAdminInstance;
}
