export const OBJ_PROPERTIES = Object.getPrototypeOf({});

export const SERVICE_FIELD_NAME = "[px]";

export const enum ObservableAnnotationTypes {
  deep = 2,
  shadow = 4,
  ref = 8,
}

export const enum ComputedAnnotationTypes {
  memo = 16,
}

export const enum AnnotationTypes {
  native = 0,
  observable = ObservableAnnotationTypes.deep,
  computed = 16,
}

export const enum Properties {
  none = 0,
  observerDeep = 1,
  observerRef = 2,
  observerShadow = 4,
}
