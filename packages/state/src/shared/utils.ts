import { EqualResolver } from "./types";

export const defaultEqualResolver: EqualResolver<unknown> = (a, b) => a === b;
