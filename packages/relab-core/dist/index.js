import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import {
  bindActionCreators,
  combineReducers,
  createStore,
  compose,
  applyMiddleware
} from "redux";
import { cloneDeep } from "lodash";
import thunk from "redux-thunk";

const KEYS = ["namespace", "state", "reducers", "effects"];
function checkModel(model, models) {
  if (process.env.NODE_ENV !== "production") {
    if (!model.namespace || typeof model.namespace !== "string") {
      throw new Error("model namespace should be string!");
    }

    if (models[model.namespace] !== undefined) {
      throw new Error(
        `The model namespace '${model.namespace}' has been registered!`
      );
    }

    const p = Object.keys(model).filter(x => !KEYS.includes(x));

    if (p.length) {
      throw new Error(
        `Do not use the following invalid attributes in the model: ${p.join(
          ", "
        )}!`
      );
    }
  }

  models[model.namespace] = model.namespace;
}

var config = {
  effectPrefix: "@@effect",
  actionPrefix: "@@action",
  reducerPrefix: "@@reducer"
};

const concat = (type, namespace, name) => {
  const ret = `${namespace}${name ? `/${name}` : ""}`;
  return `${config[type]}/${ret}`;
};

var prefix = {
  reducer(namespace, name) {
    return concat("reducerPrefix", namespace, name);
  },

  effect(namespace, name) {
    return concat("effectPrefix", namespace, name);
  }
};

function createAction(model, getState) {
  const { namespace, effects } = model;
  const actions = effects
    ? Object.keys(effects).reduce((o, k) => {
        o[k] = (...args) => dispatch => {
          dispatch({
            payload: k,
            type: prefix.reducer(namespace, "@@start")
          });
          const handler = {
            select: getState,

            commit(type, payload) {
              dispatch({
                payload,
                type: prefix.reducer(namespace, type)
              });
            },

            dispatch(action, ...payload) {
              if (typeof effects[action] !== "function") {
                throw new Error(
                  "The dispatch here only can be use to execute a effect which is defined in current effects!"
                );
              }

              return effects[action](handler, ...payload);
            }
          };
          return Promise.resolve(effects[k](handler, ...args)).then(ret => {
            dispatch({
              payload: k,
              type: prefix.reducer(namespace, "@@end")
            });
            return ret;
          });
        };

        return o;
      }, {})
    : {};
  return dispatch => bindActionCreators(actions, dispatch);
}

const initReducer = (ret, initialState) => ({
  [`${ret}/@@start`](state, name) {
    return { ...state, loading: [...state.loading, name] };
  },

  [`${ret}/@@end`](state, name) {
    return { ...state, loading: state.loading.filter(x => x !== name) };
  },

  [`${ret}/@@reset`]() {
    return initialState;
  }
});

function createReducer(model) {
  if (!model.reducers) {
    return;
  }

  Object.assign(model.state, {
    loading: []
  });
  const ret = prefix.reducer(model.namespace);
  model.reducers = Object.keys(model.reducers).reduce((o, k) => {
    o[`${ret}/${k}`] = model.reducers[k];
    return o;
  }, initReducer(ret, cloneDeep(model.state)));
  return (state = model.state, action) => {
    const h = model.reducers[action.type];
    return h ? h(state, action.payload) : state;
  };
}

let store = null;
const reducers = {};

const createReducer$1 = () => combineReducers({ ...reducers });

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

  store.replaceReducer(createReducer$1());
};

const injectModel = (namespace, reducer) => {
  if (reducer) {
    reducers[namespace] = reducer;

    if (store) {
      store.replaceReducer(createReducer$1());
    }
  }
};
const getState = namespace => {
  if (!store) {
    throw new Error("store has not yet been initialized!");
  }

  const state = store.getState();

  if (namespace) {
    return state[namespace];
  }

  return state;
};
const getStore = () => store;
const initStore = (initState = {}) => {
  let devtools = () => noop => noop;

  if (
    process.env.NODE_ENV !== "production" &&
    window.__REDUX_DEVTOOLS_EXTENSION__
  ) {
    devtools = window.__REDUX_DEVTOOLS_EXTENSION__;
  }

  store = createStore(
    createReducer$1(),
    initState,
    compose(
      applyMiddleware(thunk),
      devtools(window.__REDUX_DEVTOOLS_EXTENSION__OPTIONS)
    )
  );
  store.reset = resetStore;
  return store;
};

const models = {};
function relab(model) {
  checkModel(model, models);
  const actions = createAction(model, getState);
  const reducer = createReducer(model);
  const { namespace } = model;
  injectModel(namespace, reducer);
  return connect(
    state =>
      createStructuredSelector({
        model: o => o[namespace]
      })(state),
    actions
  );
}

export default relab;
export { getStore, initStore };
