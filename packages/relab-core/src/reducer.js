import { cloneDeep } from "lodash";
import prefix from "./prefix";

const initReducer = (ret, initialState) => ({
  [`${ret}/@@start`](state, name) {
    return {
      ...state,
      loading: [...state.loading, name]
    };
  },
  [`${ret}/@@end`](state, name) {
    return {
      ...state,
      loading: state.loading.filter(x => x !== name)
    };
  },
  [`${ret}/@@reset`]() {
    return initialState;
  }
});

export default function createReducer(model) {
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
