export const OBJ_PROPERTIES = Object.getPrototypeOf({});

export const SERVICE_FIELD_NAME = "[px]";

export const OBJECT_TYPES: ActionTypes[] = ["expansion", "compression"];

export const DEFAULT_TYPES: ActionTypes[] = ["change", "reinstall"];

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
