import { EqualResolver } from "./types";

export const defaultEqualResolver: EqualResolver<never> = (a, b) => a === b;
