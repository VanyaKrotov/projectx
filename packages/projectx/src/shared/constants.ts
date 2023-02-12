import {
  ActionTypes,
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

export const RESERVED_FIELDS = ["annotation"];

export const OBJ_PROPERTIES = Object.getPrototypeOf({});

export const OBJECT_TYPES: ActionTypes[] = ["expansion", "compression"];

export const DEFAULT_TYPES: ActionTypes[] = ["change", "reinstall"];
