import {
  ArrayAnnotation,
  ComputedAnnotation,
  ObserverAnnotation,
  ValueAnnotation,
} from "./types";

export const ANNOTATIONS = {
  observer: {
    observable: true,
  } as ObserverAnnotation,
  value: {
    observable: true,
  } as ValueAnnotation,
  computed: {
    observable: true,
    memoised: true,
  } as ComputedAnnotation,
  array: {
    observable: true,
  } as ArrayAnnotation,
};

export const __DEV__ = process.env.NODE_ENV === "development";
