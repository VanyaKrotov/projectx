import {
  AnnotationTypes,
  ComputedAnnotation,
  ObservableAnnotation,
} from "../shared";

export const none = AnnotationTypes.none;

export const observable = {
  deep: ObservableAnnotation.deep,
  shadow: ObservableAnnotation.shadow,
  ref: ObservableAnnotation.ref,
};

export const computed = {
  memo: ComputedAnnotation.memo,
};
