import { createObserver } from "../../components";
import { Properties } from "../../shared";

export function getSchemaChildren(
  schema: Schema | Properties,
  key: string | number | symbol
): Schema | Properties {
  if (typeof schema === "object") {
    return Reflect.get(schema, key);
  }

  return schema;
}

export function getMainObserver(parent?: Observer) {
  return {
    root: !parent,
    mainObserver: parent || createObserver(),
  };
}

export function getDecomposeScheme(schema: Schema) {
  const property: number =
    typeof schema === "number" ? schema : Properties.observerDeep;
  if (property & Properties.none || property & Properties.observerRef) {
    return { exit: true };
  }

  if (property & Properties.observerShadow) {
    schema = Properties.none;
  }

  return {
    schema,
    exit: false,
  };
}
