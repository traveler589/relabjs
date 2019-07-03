import { cloneDeep } from "lodash";
import prefix from "./prefix";
import {
  RelabModel,
  RelabReducer,
  RelabModelState,
  RelabActionConfig
} from "../index.d";

const initReducer = <T>(
  ret: string,
  initialState: T
): Record<string, RelabReducer<T>> => ({
  [`${ret}/@@start`](state: T, name: string) {
    return {
      ...state,
      loading: [...((state as RelabModelState<T>).loading || []), name]
    };
  },
  [`${ret}/@@end`](state: T, name: string) {
    return {
      ...state,
      loading: ((state as RelabModelState<T>).loading || []).filter(
        (x: string) => x !== name
      )
    };
  },
  [`${ret}/@@reset`]() {
    return {
      ...initialState,
      loading: []
    };
  }
});

export default function createReducer<T>(model: RelabModel<T>) {
  if (!model.reducers) {
    return;
  }

  model.state = Object.assign(
    {
      loading: []
    },
    model.state
  );

  const ret = prefix.reducer(model.namespace);

  model.reducers = Object.keys(model.reducers).reduce((o, k) => {
    o[`${ret}/${k}`] = model.reducers![k];
    return o;
  }, initReducer<T>(ret, cloneDeep(model.state)));

  return (state = model.state, action: RelabActionConfig) => {
    const h = model.reducers![action.type];

    return h ? h(state, action.payload) : state;
  };
}
