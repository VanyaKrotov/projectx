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

  // src/modules/root-manager.ts
  var RootManager = class {
    constructor() {
      __publicField(this, "managers", {});
      __publicField(this, "reactions", {});
    }
    addReaction(id, reaction) {
      this.reactions[id] = reaction;
    }
    deleteReaction(id) {
      return delete this.reactions[id];
    }
    getReaction(id) {
      return this.reactions[id];
    }
    addManager(manager) {
      this.managers[manager.name] = manager;
    }
    getManager(id) {
      return this.managers[id];
    }
    getManagerByPathRecursive(root, [path, ...rest]) {
      if (root.name === path) {
        return root;
      }
      if (!rest.length) {
        return root.managers[path];
      }
      return this.getManagerByPathRecursive(root.managers[path], rest);
    }
    getManagerByPath([
      rootPath,
      ...restPath
    ]) {
      return this.getManagerByPathRecursive(this.managers[rootPath], restPath);
    }
  };
  var root_manager_default = new RootManager();

  // node_modules/nanoid/index.browser.js
  var nanoid = (size = 21) => crypto.getRandomValues(new Uint8Array(size)).reduce((id, byte) => {
    byte &= 63;
    if (byte < 36) {
      id += byte.toString(36);
    } else if (byte < 62) {
      id += (byte - 26).toString(36).toUpperCase();
    } else if (byte > 62) {
      id += "-";
    } else {
      id += "_";
    }
    return id;
  }, "");

  // src/shared/utils.ts
  function isObject(target) {
    return target && typeof target === "object" && !Array.isArray(target);
  }
  function isFunction(functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === "[object Function]";
  }
  function createUniqPath(path = "ObservableState") {
    return `${path}$${nanoid(4)}`;
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

  // src/modules/batch.ts
  var Batch = class {
    constructor() {
      __publicField(this, "batches", []);
    }
    get hasBatch() {
      return this.batches.length > 0;
    }
    open() {
      this.batches.push(/* @__PURE__ */ new Set());
    }
    action(handler) {
      if (!this.hasBatch) {
        return handler();
      }
      this.batches[this.batches.length - 1].add(handler);
    }
    closeBatch() {
      const batch2 = this.batches.pop();
      if (!batch2) {
        return;
      }
      batch2.forEach((handler) => handler());
    }
  };
  var batch = new Batch();
  var batch_default = batch;

  // src/modules/optimization-tree.ts
  var TreeNode = class {
    constructor(value, manager) {
      this.value = value;
      this.manager = manager;
      __publicField(this, "children", {});
      __publicField(this, "listenTypes", []);
    }
    get keys() {
      return Object.keys(this.children);
    }
    pushPath([path, ...paths]) {
      var _a;
      const nextNode = this.children[path] || new TreeNode(path, ((_a = this.manager) == null ? void 0 : _a.getManager(path)) || null);
      this.children[path] = nextNode;
      if (!paths.length) {
        return;
      }
      return nextNode.pushPath(paths);
    }
  };
  var OptimizationTree = class extends TreeNode {
    constructor(paths) {
      super("", null);
      this.children = OptimizationTree.createNodesFromPaths(paths);
      this.linking();
    }
    static createNodesFromPaths(paths) {
      const nodes = {};
      for (const full of paths) {
        const [path, ...rest] = full;
        nodes[path] = nodes[path] || new TreeNode(path, root_manager_default.getManager(path));
        nodes[path].pushPath(rest);
      }
      return nodes;
    }
    linkingRecursive(node) {
      const keys = Object.keys(node.children);
      if (!keys.length) {
        return node.listenTypes = ["all"];
      }
      node.listenTypes = isEqualArray(keys, node.manager.keys) ? ["add", "change", "remove"] : ["change"];
      for (const key of keys) {
        this.linkingRecursive(node.children[key]);
      }
    }
    linking() {
      for (const key in this.children) {
        this.linkingRecursive(this.children[key]);
      }
    }
    optimizedManagersRec(node) {
      let res = [
        { listenTypes: node.listenTypes, manager: node.manager }
      ];
      if (!node.keys.length) {
        return res;
      }
      for (const key in node.children) {
        res = res.concat(this.optimizedManagersRec(node.children[key]));
      }
      return res;
    }
    getListenManagers() {
      let result = [];
      for (const key in this.children) {
        result = result.concat(this.optimizedManagersRec(this.children[key]));
      }
      return result;
    }
  };
  var optimization_tree_default = OptimizationTree;

  // src/modules/interceptor.ts
  var Interceptor = class {
    constructor() {
      __publicField(this, "batches", /* @__PURE__ */ new Set());
    }
    watch(fn, listener) {
      this.register(listener);
      const result = fn();
      this.unregister(listener);
      return result;
    }
    register(listener) {
      this.batches.add(listener);
    }
    unregister(listener) {
      this.batches.delete(listener);
    }
    emit(event) {
      if (!this.batches.size) {
        return;
      }
      Array.from(this.batches).pop()(event);
    }
    getCaptured(fn) {
      const paths = [];
      const result = this.watch(fn, ({ path }) => {
        paths.push(path);
      });
      return {
        result,
        variables: new optimization_tree_default(paths)
      };
    }
    optimizePaths(paths) {
      return new optimization_tree_default(paths);
    }
  };
  var interceptor = new Interceptor();
  var interceptor_default = interceptor;

  // src/modules/reaction.ts
  var Reaction = class {
    constructor(id = `Reaction#${nanoid(4)}`) {
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
      root_manager_default.addReaction(id, this);
    }
    getOptimizationTree() {
      if (!this.paths.length) {
        return null;
      }
      return new optimization_tree_default(this.paths);
    }
    dispose() {
      root_manager_default.deleteReaction(this.id);
      this.paths = [];
      this.unlisten();
    }
    startWatch() {
      this.paths = [];
      interceptor_default.register(this.listener);
    }
    endWatch() {
      interceptor_default.unregister(this.listener);
    }
    watch(watch2) {
      const tree = this.getOptimizationTree();
      if (!tree) {
        console.warn(
          `Instances for listen in reaction \`${this.id}\` not found. Reconsider the use of adverse reactions.`
        );
        return () => {
        };
      }
      const managers = tree.getListenManagers();
      const handler = () => watch2(this.unlisten);
      this.unlisten();
      this.unsubscribeFns = managers.map(
        ({ listenTypes, manager }) => manager.listen(listenTypes, () => {
          batch_default.action(handler);
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
      if (Array.isArray(type)) {
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
      this.emit("dispose", { prev: this.snapshot });
    }
    reportUsage() {
      if (!this.annotation.observable) {
        return;
      }
      interceptor_default.emit({ path: this.path });
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
  };
  var manager_default = Manager;

  // src/modules/components/constants.ts
  var OBSERVER_ANNOTATION = {
    observable: true
  };
  var VALUE_ANNOTATION = {
    observable: true
  };
  var COMPUTED_ANNOTATION = {
    observable: true,
    memoised: true
  };
  var ARRAY_ANNOTATION = {
    observable: true
  };

  // src/modules/components/object-manager.ts
  var ComputedManager = class extends manager_default {
    constructor(target, options) {
      super(options, COMPUTED_ANNOTATION);
      this.target = target;
      __publicField(this, "reaction");
      __publicField(this, "savedResult");
      __publicField(this, "isMemoized", false);
      __publicField(this, "isChanged", false);
      __publicField(this, "managers");
      this.reaction = new Reaction(`Computed#${this.path.join(".")}`);
      this.emit("define", { current: this.snapshot });
    }
    getManager() {
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
    setValue() {
      return false;
    }
    dispose() {
      this.reaction.dispose();
      super.dispose();
    }
  };
  var ObjectManager = class extends manager_default {
    constructor(target, options) {
      super(options, OBSERVER_ANNOTATION);
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
          const result = this.defineProperty(
            key,
            prop,
            this.annotationOptions.fields[String(key)]
          );
          this.emit("add", {
            current: this.value
          });
          return result;
        }
      });
      this.proxy = this.define(target);
    }
    get annotationOptions() {
      const annotation = this.target.annotation || {};
      return __spreadValues({
        fields: {},
        getters: {}
      }, annotation);
    }
    defineProperty(key, { value, configurable = true, enumerable = true }, options) {
      this.managers[key] = observable(value, {
        path: this.joinToPath(key),
        annotation: options
      });
      Object.defineProperty(this.target, key, {
        configurable,
        enumerable,
        get: () => this.managers[key].value,
        set: (value2) => this.managers[key].setValue(value2)
      });
      return true;
    }
    defineComputed(key, _a, options) {
      var _b = _a, { get } = _b, descriptions = __objRest(_b, ["get"]);
      this.managers[key] = new ComputedManager(get.bind(this.target), {
        path: this.joinToPath(key),
        annotation: options
      });
      Object.defineProperty(this.target, key, __spreadProps(__spreadValues({}, descriptions), {
        get: this.managers[key].value
      }));
    }
    get name() {
      return this.path[this.path.length - 1];
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
    setValue(value) {
      this.target = value;
      const prev = __spreadValues({}, this.target);
      this.proxy = this.define(value);
      this.emit("change", {
        current: value,
        prev
      });
      return true;
    }
    clearManagers() {
      for (const key in this.managers) {
        this.managers[key].dispose();
      }
      this.managers = {};
    }
    dispose() {
      super.dispose();
      this.clearManagers();
    }
    getManager(key) {
      return this.managers[key];
    }
    define(target) {
      this.clearManagers();
      const proxy = new Proxy(target, this.handlers);
      const getters = getGetters(target, ["annotation"]);
      const annotation = this.annotationOptions;
      for (const key in target) {
        this.defineProperty(key, { value: target[key] }, annotation.fields[key]);
      }
      for (const key in getters) {
        this.defineComputed(key, getters[key], annotation.getters[key]);
      }
      return proxy;
    }
  };
  var object_manager_default = ObjectManager;

  // src/modules/components/value-manager.ts
  var ValueManager = class extends manager_default {
    constructor(target, options) {
      super(options, VALUE_ANNOTATION);
      this.target = target;
      this.emit("define", { current: target });
    }
    get value() {
      this.reportUsage();
      return this.target;
    }
    setValue(value) {
      const prev = this.target;
      this.target = value;
      this.emit("change", {
        current: value,
        prev
      });
      return true;
    }
    getManager() {
      return null;
    }
  };
  var value_manager_default = ValueManager;

  // src/modules/components/array-manager.ts
  var ArrayManager = class extends manager_default {
    constructor(target, options) {
      super(options, ARRAY_ANNOTATION);
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
              return this.managers[index].setValue(value);
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
    setValue(value) {
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
    getManager(key) {
      return this.managers[Number(key)];
    }
    clearManagers() {
      for (const manager of this.managers) {
        manager.dispose();
      }
      this.managers = [];
    }
    dispose() {
      super.dispose();
      this.clearManagers();
    }
    define(target) {
      this.clearManagers();
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
  function observableValue(manager) {
    root_manager_default.addManager(manager);
    return manager.value;
  }
  console.log(root_manager_default);
  var observable2 = {
    object: (target) => observableValue(new object_manager_default(target, { path: [createUniqPath()] })),
    class: (Target) => observableValue(
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
    batch_default.open();
    callback();
    batch_default.closeBatch();
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
//# sourceMappingURL=project_1.js.map
