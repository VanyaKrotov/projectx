import { ActionTypes } from "./types";

export const ANNOTATIONS = {
  observer: {},
  value: {},
  computed: {
    memoised: true,
  },
  array: {},
};

export const RESERVED_FIELDS = ["annotation"];

export const OBJ_PROPERTIES = Object.getPrototypeOf({});

export const OBJECT_TYPES: ActionTypes[] = ["expansion", "compression"];

export const DEFAULT_TYPES: ActionTypes[] = ["change", "reinstall"];

export enum ObservableAnnotation {
  deep = 2,
  shadow = 4,
  ref = 8,
}

export enum ComputedAnnotation {
  memo = 16,
}

export enum AnnotationTypes {
  none = 0,
  observable = ObservableAnnotation.deep,
  computed = ComputedAnnotation.memo,
}
