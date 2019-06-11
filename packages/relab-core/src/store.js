import { createStore, applyMiddleware, compose, combineReducers } from "redux";
import thunk from "redux-thunk";
import prefix from "./prefix";

let store = null;
const reducers = {};

const createReducer = () => combineReducers({ ...reducers });

const resetStore = namespace => {
  if (!store) {
    return;
  }

  if (namespace && reducers[namespace]) {
    store.dispatch({
      type: prefix.reducer(namespace, "@@reset")
    });
  } else {
    Object.keys(reducers).forEach(x => {
      store.dispatch({
        type: prefix.reducer(x, "@@reset")
      });
    });
  }

  store.replaceReducer(createReducer());
};

export const injectModel = (namespace, reducer) => {
  if (reducer) {
    reducers[namespace] = reducer;

    if (store) {
      store.replaceReducer(createReducer());
    }
  }
};

export const getState = namespace => {
  if (!store) {
    throw new Error("store has not yet been initialized!");
  }

  const state = store.getState();

  if (namespace) {
    return state[namespace];
  }

  return state;
};

export const getStore = () => store;

export const initStore = (initState = {}) => {
  let devtools = () => noop => noop;

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

  store.reset = resetStore;

  return store;
};
