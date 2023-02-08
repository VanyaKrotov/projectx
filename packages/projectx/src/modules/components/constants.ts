import {
  ArrayAnnotation,
  ComputedAnnotation,
  ObserverAnnotation,
  ValueAnnotation,
} from "shared/types";

export const OBSERVER_ANNOTATION: ObserverAnnotation = {
  observable: true,
};

export const VALUE_ANNOTATION: ValueAnnotation = {
  observable: true,
};

export const COMPUTED_ANNOTATION: ComputedAnnotation = {
  observable: true,
  memoised: true,
};

export const ARRAY_ANNOTATION: ArrayAnnotation = {
  observable: true,
};
