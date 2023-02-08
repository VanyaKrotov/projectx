"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj2, key, value) => key in obj2 ? __defProp(obj2, key, { enumerable: true, configurable: true, writable: true, value }) : obj2[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __objRest = (source, exclude) => {
    var target = {};
    for (var prop in source)
      if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
        target[prop] = source[prop];
    if (source != null && __getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(source)) {
        if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
          target[prop] = source[prop];
      }
    return target;
  };
  var __publicField = (obj2, key, value) => {
    __defNormalProp(obj2, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // src/components/batch.ts
  var Batch = class {
    constructor() {
      __publicField(this, "batches", []);
    }
    open() {
      this.batches.push(/* @__PURE__ */ new Set());
    }
    action(handler) {
      if (!this.batches.length) {
        return handler();
      }
      this.batches[this.batches.length - 1].add(handler);
    }
    close() {
      const batch2 = this.batches.pop();
      if (!batch2) {
        return;
      }
      batch2.forEach((handler) => handler());
    }
  };
  var batch_default = Batch;

  // src/components/interceptor.ts
  var Interceptor = class {
    constructor() {
      __publicField(this, "listeners", /* @__PURE__ */ new Set());
    }
    register(listener) {
      this.listeners.add(listener);
    }
    unregister(listener) {
      this.listeners.delete(listener);
    }
    emit(event) {
      if (!this.listeners.size) {
        return;
      }
      Array.from(this.listeners).pop()(event);
    }
  };
  var interceptor_default = Interceptor;

  // src/shared/constants.ts
  var ANNOTATIONS = {
    observer: {
      observable: true
    },
    value: {
      observable: true
    },
    computed: {
      observable: true,
      memoised: true
    },
    array: {
      observable: true
    }
  };
  var __DEV__ = true;

  // src/modules/initialize.ts
  var interceptor = new interceptor_default();
  var batch = new batch_default();
  var managers = /* @__PURE__ */ new Map();
  var reactions = /* @__PURE__ */ new Map();
  if (__DEV__) {
    console.log("ProjectX data: ", { interceptor, batch, managers, reactions });
  }

  // src/shared/uid.ts
  function uidGenerator() {
    let i = 0;
    return () => i++;
  }
  var uid = uidGenerator();

  // src/shared/utils.ts
  function isObject(target) {
    return target && typeof target === "object" && !Array.isArray(target);
  }
  function isFunction(functionToCheck) {
    return typeof functionToCheck === "function";
  }
  function createUniqPath(path = "ObservableState") {
    return `${path}#${uid()}`;
  }
  function runAfterScript(fn) {
    return Promise.resolve().then(fn);
  }
  function getGetters(obj2, ignoredKeys = []) {
    const descriptions = Object.getOwnPropertyDescriptors(
      Object.getPrototypeOf(obj2)
    );
    const result = {};
    for (const key in descriptions) {
      const description = descriptions[key];
      if (!description.writable && description.get && !description.set && !ignoredKeys.includes(key)) {
        result[key] = description;
      }
    }
    return result;
  }
  function isEqualArray(arr1, arr2) {
    if (arr1.length !== arr2.length) {
      return false;
    }
    return arr1.every((key) => arr2.indexOf(key) !== -1);
  }

  // src/modules/observable.ts
  function observable(target, options) {
    if (Array.isArray(target)) {
      return new array_manager_default(target, options);
    }
    if (isObject(target)) {
      return new object_manager_default(target, options);
    }
    if (target instanceof Set) {
      return target;
    }
    if (target instanceof Map) {
      return target;
    }
    return new value_manager_default(target, options);
  }

  // src/components/observer.ts
  var Observer = class {
    constructor() {
      __publicField(this, "listeners", /* @__PURE__ */ new Set());
    }
    listen(listener) {
      this.listeners.add(listener);
      return () => {
        this.listeners.delete(listener);
      };
    }
    emit(event) {
      for (const listener of this.listeners) {
        if (listener(event)) {
          break;
        }
      }
    }
  };
  var ObserverWithType = class {
    constructor() {
      __publicField(this, "listenerMap", /* @__PURE__ */ new Map());
      __publicField(this, "observable", true);
    }
    listen(type, callback) {
      if (!this.observable) {
        return () => {
        };
      }
      const unlisten = [];
      const types = Array.isArray(type) ? type : [type];
      for (const eachType of types) {
        const listeners = this.listenerMap.get(eachType) || new Observer();
        this.listenerMap.set(eachType, listeners);
        unlisten.push(listeners.listen(callback));
      }
      return () => {
        unlisten.forEach((fn) => fn());
      };
    }
    emit(type, event) {
      if (!this.observable || event.current === event.prev) {
        return;
      }
      const listeners = this.listenerMap.get(type);
      const allListeners = this.listenerMap.get("all");
      if (listeners) {
        listeners.emit(event);
      }
      if (allListeners) {
        allListeners.emit(event);
      }
    }
  };

  // src/modules/components/manager.ts
  var Manager = class extends ObserverWithType {
    constructor({ path, annotation }, defaultAnnotation) {
      super();
      __publicField(this, "annotation", {});
      __publicField(this, "path", []);
      this.path = path;
      this.annotation = __spreadValues(__spreadValues({}, defaultAnnotation), annotation);
      this.observable = this.annotation.observable;
    }
    dispose() {
      this.path = [];
      this.disposeManagers();
      this.emit("dispose", { prev: this.snapshot });
    }
    reportUsage() {
      if (!this.annotation.observable) {
        return;
      }
      interceptor.emit({ path: this.path });
    }
    joinToPath(key) {
      return [...this.path, String(key)];
    }
    get name() {
      return this.path[this.path.length - 1];
    }
    get snapshot() {
      return this.target;
    }
    get keys() {
      return [];
    }
    toString() {
      return String(this.snapshot);
    }
    disposeManagers() {
    }
  };
  var manager_default = Manager;

  // src/modules/paths-tree.ts
  var PathNode = class {
    constructor(value, manager) {
      this.value = value;
      this.manager = manager;
      __publicField(this, "children", {});
      __publicField(this, "listenTypes", []);
    }
    get keys() {
      return Object.keys(this.children);
    }
    push([path, ...paths]) {
      const nextNode = this.children[path] || new PathNode(path, this.manager.manager(path));
      this.children[path] = nextNode;
      if (!paths.length) {
        return;
      }
      return nextNode.push(paths);
    }
  };
  var PathTree = class {
    constructor(paths) {
      __publicField(this, "nodes", {});
      for (const [path, ...restPath] of paths) {
        this.nodes[path] = this.nodes[path] || new PathNode(path, managers.get(path));
        this.nodes[path].push(restPath);
      }
      for (const key in this.nodes) {
        this.linkingRec(this.nodes[key]);
      }
    }
    linkingRec(node) {
      const keys = Object.keys(node.children);
      if (!keys.length) {
        return node.listenTypes = ["all"];
      }
      node.listenTypes = isEqualArray(keys, node.manager.keys) ? ["add", "change", "remove"] : ["change"];
      for (const key of keys) {
        this.linkingRec(node.children[key]);
      }
    }
    optimizedRec(node) {
      let result = [
        { listenTypes: node.listenTypes, manager: node.manager }
      ];
      if (!node.keys.length) {
        return result;
      }
      for (const key in node.children) {
        result = result.concat(this.optimizedRec(node.children[key]));
      }
      return result;
    }
    getListenManagers() {
      let result = [];
      for (const key in this.nodes) {
        result = result.concat(this.optimizedRec(this.nodes[key]));
      }
      return result;
    }
  };
  var paths_tree_default = PathTree;

  // src/modules/reaction.ts
  var Reaction = class {
    constructor(id = `Reaction#${uid()}`) {
      this.id = id;
      __publicField(this, "paths", []);
      __publicField(this, "unsubscribeFns", []);
      __publicField(this, "listener", ({ path }) => {
        this.paths.push(path);
      });
      __publicField(this, "unlisten", () => {
        if (!this.unsubscribeFns.length) {
          return;
        }
        this.unsubscribeFns.forEach((unlistener) => unlistener());
        this.unsubscribeFns = [];
      });
      reactions.set(id, this);
    }
    getPathTree() {
      if (!this.paths.length) {
        return null;
      }
      return new paths_tree_default(this.paths);
    }
    dispose() {
      reactions.delete(this.id);
      this.paths = [];
      this.unlisten();
    }
    startWatch() {
      this.paths = [];
      interceptor.register(this.listener);
    }
    endWatch() {
      interceptor.unregister(this.listener);
    }
    watch(watch2) {
      const tree = this.getPathTree();
      if (!tree) {
        console.warn(
          `Instances for listen in reaction \`${this.id}\` not found. Reconsider the use of adverse reactions.`
        );
        return () => {
        };
      }
      const managers2 = tree.getListenManagers();
      const handler = () => watch2(this.unlisten);
      this.unlisten();
      this.unsubscribeFns = managers2.map(
        ({ listenTypes, manager }) => manager.listen(listenTypes, () => {
          batch.action(handler);
        })
      );
      return this.unlisten;
    }
    syncCaptured(fn) {
      this.startWatch();
      const result = fn();
      this.endWatch();
      return result;
    }
  };

  // src/modules/components/computed-manager.ts
  var ComputedManager = class extends manager_default {
    constructor(target, options) {
      super(options, ANNOTATIONS.computed);
      this.target = target;
      __publicField(this, "reaction");
      __publicField(this, "savedResult");
      __publicField(this, "isMemoized", false);
      __publicField(this, "isChanged", false);
      __publicField(this, "managers", null);
      this.reaction = new Reaction(`Computed#${this.path.join(".")}`);
      this.emit("define", { current: this.snapshot });
    }
    manager() {
      return null;
    }
    get snapshot() {
      return this.target();
    }
    get value() {
      const { memoised } = this.annotation;
      if (!memoised) {
        return this.target;
      }
      return () => {
        this.reportUsage();
        if (this.isMemoized && !this.isChanged) {
          return this.savedResult;
        }
        this.savedResult = this.reaction.syncCaptured(this.target);
        this.isMemoized = true;
        this.isChanged = false;
        this.reaction.watch(() => {
          this.isChanged = true;
          runAfterScript(() => {
            this.emit("change", {
              current: void 0,
              prev: this.savedResult
            });
          });
        });
        return this.savedResult;
      };
    }
    set() {
      return false;
    }
    dispose() {
      this.reaction.dispose();
      super.dispose();
    }
  };
  var computed_manager_default = ComputedManager;

  // src/modules/components/object-manager.ts
  var ObjectManager = class extends manager_default {
    constructor(target, options) {
      super(options, ANNOTATIONS.observer);
      this.target = target;
      __publicField(this, "managers", {});
      __publicField(this, "proxy");
      __publicField(this, "handlers", {
        deleteProperty: (_target, key) => {
          const manager = this.managers[key];
          const deleteResult = delete this.managers[key];
          if (deleteResult) {
            manager.dispose();
            this.emit("remove", { prev: manager.value });
          }
          return deleteResult;
        },
        defineProperty: (_target, key, prop) => {
          const result = this.defineProp(
            key,
            prop,
            this.annotations.fields[String(key)]
          );
          this.emit("add", {
            current: this.value
          });
          return result;
        }
      });
      this.proxy = this.define(target);
    }
    get annotations() {
      const annotation = this.target.annotation || {};
      return __spreadValues({
        fields: {},
        getters: {}
      }, annotation);
    }
    defineProp(key, { value, configurable = true, enumerable = true }, options) {
      this.managers[key] = observable(value, {
        path: this.joinToPath(key),
        annotation: options
      });
      Object.defineProperty(this.target, key, {
        configurable,
        enumerable,
        get: () => this.managers[key].value,
        set: (value2) => this.managers[key].set(value2)
      });
      return true;
    }
    defineComp(key, _a, options) {
      var _b = _a, { get } = _b, descriptions = __objRest(_b, ["get"]);
      this.managers[key] = new computed_manager_default(get.bind(this.target), {
        path: this.joinToPath(key),
        annotation: options
      });
      Object.defineProperty(this.target, key, __spreadProps(__spreadValues({}, descriptions), {
        get: this.managers[key].value
      }));
    }
    get snapshot() {
      return Object.entries(this.managers).reduce(
        (acc, [key, value]) => Object.assign(acc, { [key]: value.snapshot }),
        {}
      );
    }
    get value() {
      this.reportUsage();
      return this.proxy;
    }
    get keys() {
      return Object.keys(this.managers);
    }
    set(value) {
      this.target = value;
      const prev = __spreadValues({}, this.target);
      this.proxy = this.define(value);
      this.emit("change", {
        current: value,
        prev
      });
      return true;
    }
    disposeManagers() {
      for (const key in this.managers) {
        this.managers[key].dispose();
      }
      this.managers = {};
    }
    manager(key) {
      return this.managers[key];
    }
    define(target) {
      this.disposeManagers();
      const proxy = new Proxy(target, this.handlers);
      const getters = getGetters(target, ["annotation"]);
      const annotation = this.annotations;
      for (const key in target) {
        this.defineProp(key, { value: target[key] }, annotation.fields[key]);
      }
      for (const key in getters) {
        this.defineComp(key, getters[key], annotation.getters[key]);
      }
      return proxy;
    }
  };
  var object_manager_default = ObjectManager;

  // src/modules/components/value-manager.ts
  var ValueManager = class extends manager_default {
    constructor(target, options) {
      super(options, ANNOTATIONS.value);
      this.target = target;
      this.emit("define", { current: target });
    }
    get value() {
      this.reportUsage();
      return this.target;
    }
    set(value) {
      const prev = this.target;
      this.target = value;
      this.emit("change", {
        current: value,
        prev
      });
      return true;
    }
    manager() {
      return null;
    }
  };
  var value_manager_default = ValueManager;

  // src/modules/components/array-manager.ts
  var ArrayManager = class extends manager_default {
    constructor(target, options) {
      super(options, ANNOTATIONS.array);
      this.target = target;
      __publicField(this, "managers", []);
      __publicField(this, "proxy");
      __publicField(this, "handlers", {
        get: (_target, key) => {
          var _a;
          const index = Number(key);
          if (!Number.isNaN(index)) {
            return (_a = this.managers[index]) == null ? void 0 : _a.value;
          }
          const value = this.target[key];
          if (isFunction(value)) {
            return (...args) => value.call(this.proxy, ...args);
          }
          return value;
        },
        set: (_target, key, value) => {
          const index = Number(key);
          if (!Number.isNaN(index)) {
            if (index in this.managers) {
              return this.managers[index].set(value);
            }
            try {
              this.managers[index] = observable(value, {
                path: this.joinToPath(key)
              });
              this.target[index] = value;
              this.emit("add", { current: this.value });
              return true;
            } catch (e) {
              return false;
            }
          }
          this.target[key] = value;
          return true;
        },
        deleteProperty: (_target, key) => {
          const index = Number(key);
          if (Number.isNaN(index)) {
            return false;
          }
          if (!(index in this.target)) {
            return false;
          }
          const manager = this.managers[index];
          const deleteResult = this.target.splice(index, 1).length === 1;
          if (deleteResult) {
            if (manager) {
              this.managers.splice(index, 1);
              manager.dispose();
            }
          }
          return deleteResult;
        }
      });
      this.proxy = this.define(target);
      this.emit("define", { current: this.value });
    }
    set(value) {
      const prev = this.value;
      this.target = value;
      this.proxy = this.define(value);
      this.emit("change", {
        current: value,
        prev
      });
      return true;
    }
    get snapshot() {
      return [...this.target];
    }
    get keys() {
      const result = [];
      for (const index in this.target) {
        result.push(index);
      }
      return result;
    }
    get value() {
      this.reportUsage();
      return this.proxy;
    }
    manager(key) {
      return this.managers[Number(key)];
    }
    disposeManagers() {
      for (const manager of this.managers) {
        manager.dispose();
      }
      this.managers = [];
    }
    define(target) {
      this.disposeManagers();
      for (const item of target) {
        this.managers.push(
          observable(item, {
            path: this.joinToPath(String(this.managers.length))
          })
        );
      }
      return new Proxy(target, this.handlers);
    }
  };
  var array_manager_default = ArrayManager;

  // src/modules/make-observable.ts
  function register(manager) {
    managers.set(manager.name, manager);
    return manager.value;
  }
  var observable2 = {
    object: (target) => register(new object_manager_default(target, { path: [createUniqPath()] })),
    class: (Target) => register(
      new object_manager_default(new Target(), { path: [createUniqPath(Target.name)] })
    ),
    array: (target) => new array_manager_default(target, { path: [createUniqPath()] }),
    map: (target) => target,
    set: (target) => target
  };

  // src/modules/autorun.ts
  function autorun(fn) {
    const reaction = new Reaction();
    reaction.syncCaptured(fn);
    const watch2 = () => {
      reaction.syncCaptured(fn);
      runAfterScript(() => reaction.watch(watch2));
    };
    reaction.watch(watch2);
    return () => {
      reaction.dispose();
    };
  }

  // src/modules/transaction.ts
  function transaction(callback) {
    batch.open();
    callback();
    batch.close();
  }

  // src/dev.ts
  var BaseState = class {
    constructor() {
      __publicField(this, "counter", 1);
      __publicField(this, "array", [10, 23]);
    }
    get mul() {
      return this.counter * 2;
    }
  };
  var State = class extends BaseState {
    increment() {
      this.counter++;
    }
    decrement() {
      this.counter--;
    }
    fetch() {
      this.array[0] = this.counter + 1;
    }
    push() {
      transaction(() => {
        this.counter++;
        this.array.push(this.array.length * this.counter);
        this.counter++;
      });
    }
  };
  var obj = {
    counter: 1,
    inc() {
      this.counter++;
    },
    dec() {
      this.counter--;
    }
  };
  var state = observable2.class(State);
  var stateObj = observable2.object(obj);
  console.log(state);
  var div = document.createElement("div");
  var div1 = document.createElement("div");
  var div2 = document.createElement("div");
  var buttonPlus = document.createElement("button");
  var buttonMinus = document.createElement("button");
  var buttonPlus2 = document.createElement("button");
  var buttonMinus2 = document.createElement("button");
  var buttonFetch = document.createElement("button");
  var buttonPush = document.createElement("button");
  buttonMinus.innerText = "-";
  buttonPlus.innerText = "+";
  buttonPlus2.innerText = "+";
  buttonMinus2.innerText = "-";
  buttonFetch.innerText = "fetch";
  buttonPush.innerText = "push";
  autorun(() => {
    console.log("trigger counter");
    div.innerText = `state: ${state.counter}`;
  });
  autorun(() => {
    console.log("trigger stateObj");
    div1.innerText = `stateObj: ${stateObj.counter}`;
  });
  autorun(() => {
    console.log("trigger array");
    div2.innerText = `arr: ${JSON.stringify(state.array)}`;
    div.innerText = `state: ${state.counter}`;
  });
  buttonPlus.addEventListener("click", () => {
    state.increment();
  });
  buttonMinus.addEventListener("click", () => {
    state.decrement();
  });
  buttonPlus2.addEventListener("click", () => {
    stateObj.inc();
  });
  buttonMinus2.addEventListener("click", () => {
    stateObj.dec();
  });
  buttonFetch.addEventListener("click", () => {
    state.fetch();
  });
  buttonPush.addEventListener("click", () => {
    state.push();
  });
  document.body.appendChild(div);
  document.body.appendChild(div1);
  document.body.appendChild(div2);
  document.body.appendChild(buttonPlus);
  document.body.appendChild(buttonMinus);
  document.body.appendChild(buttonPlus2);
  document.body.appendChild(buttonMinus2);
  document.body.appendChild(buttonFetch);
  document.body.appendChild(buttonPush);
})();
//# sourceMappingURL=index.js.map
