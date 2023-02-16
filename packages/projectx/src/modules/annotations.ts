import { AnnotationTypes, ObservableAnnotationTypes } from "../shared";

export const native = AnnotationTypes.native;

export const observable = {
  deep: ObservableAnnotationTypes.deep,
  shadow: ObservableAnnotationTypes.shadow,
  ref: ObservableAnnotationTypes.ref,
};
