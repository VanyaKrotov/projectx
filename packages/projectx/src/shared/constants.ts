import {
  ArrayAnnotation,
  ComputedAnnotation,
  ObserverAnnotation,
  ValueAnnotation,
} from "./types";

export const ANNOTATIONS = {
  observer: {} as ObserverAnnotation,
  value: {} as ValueAnnotation,
  computed: {
    memoised: true,
  } as ComputedAnnotation,
  array: {} as ArrayAnnotation,
};

export const __DEV__ = process.env.NODE_ENV === "development";

export const RESERVED_FIELDS = ["annotation"];

export const OBJ_PROPERTIES = Object.getPrototypeOf({});
