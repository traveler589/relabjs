import {
  createStore,
  applyMiddleware,
  compose,
  combineReducers,
  Store,
  Reducer
} from "redux";
import thunk from "redux-thunk";
import config from "./config";
import prefix from "./prefix";
import { RelabAction, RelabActionOption, RelabActionConfig } from "../index.d";

let store: Store | null = null;
const actions: Record<string, any> = {};
const reducers: Record<string, any> = {};
const noop = (x: any) => x;

const createReducer = () => {
  if (Object.keys(reducers).length) {
    return combineReducers({ ...reducers });
  }

  return noop;
};

const select = (type: string, payload: any, option?: RelabActionOption) => {
  const global = option instanceof Object && option.root === true;
  const args = type.split("/");

  if (args.length > 1 && global) {
    throw new Error(
      `Namespace action and root action should not be used at the same time!`
    );
  }

  const effect = args.pop();
  const namespace = global
    ? config.globalSpace
    : args.pop() || config.globalSpace;

  if (process.env.NODE_ENV !== "production") {
    const name = namespace === config.globalSpace ? "global" : namespace;

    if (!effect) {
      throw new Error(`The action type is invalid in the ${name} namespace`);
    }

    if (!actions[namespace]) {
      throw new Error(`The ${name} namespace is not exist!`);
    }

    if (!actions[namespace][effect]) {
      throw new Error(
        `The effect '${effect}' is not defined in the ${name} namespace model!`
      );
    }
  }

  return actions[namespace][effect || ""](payload);
};

const resetStore = (namespace?: string) => {
  if (!store) {
    return;
  }

  if (namespace && reducers[namespace]) {
    store.dispatch({
      type: prefix.reducer(namespace, "@@reset")
    });
  } else {
    Object.keys(reducers).forEach(x => {
      store &&
        store.dispatch({
          type: prefix.reducer(x, "@@reset")
        });
    });
  }

  store.replaceReducer(createReducer());
};

export const injectModel = (
  namespace: string,
  reducer: Reducer | undefined,
  action: Record<string, RelabAction>
) => {
  if (reducer) {
    reducers[namespace] = reducer;

    if (store) {
      store.replaceReducer(createReducer());
    }
  }
  if (action) {
    actions[namespace] = action;
  }
};

export const getAction = (
  action: RelabActionConfig | string,
  rest: any,
  option?: RelabActionOption
) => {
  if (!action) {
    throw new Error("The action can not be empty!");
  }

  if (typeof action === "string") {
    return select(action, rest, option);
  }

  if (action instanceof Object) {
    if (typeof action.type !== "string") {
      throw new Error(
        "The action object must contain a 'type' attribute of a string type!"
      );
    }

    const { type, ...payload } = action;

    return select(type, payload, rest);
  }

  throw new Error(
    `The action must be a string or object，but get the type: ${typeof action}!`
  );
};

export const getState = (namespace?: string) => {
  if (!store) {
    throw new Error("The store has not yet been initialized!");
  }

  const state = store.getState();

  if (namespace) {
    return state[namespace];
  }

  return state;
};

export const initStore = (initState = {}) => {
  let devtools = (x?: any) => noop;

  if (
    process.env.NODE_ENV !== "production" &&
    window.__REDUX_DEVTOOLS_EXTENSION__
  ) {
    devtools = window.__REDUX_DEVTOOLS_EXTENSION__;
  }

  store = createStore(
    createReducer(),
    initState,
    compose(
      applyMiddleware(thunk),
      devtools(window.__REDUX_DEVTOOLS_EXTENSION__OPTIONS)
    )
  );

  return store;
};

export const customStore = {
  reset: resetStore,
  getState: getState,
  dispatch(action: RelabActionConfig | string, payload?: any) {
    if (!store) {
      throw new Error("The store has not yet been initialized!");
    }

    return store.dispatch(getAction(action, payload));
  }
};
