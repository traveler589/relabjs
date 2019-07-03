import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import { createStructuredSelector } from "reselect";
import check from "./check";
import createAction from "./action";
import createReducer from "./reducer";
import { injectModel, getState, getAction } from "./store";
import { RelabModel, RelabStoreState } from "../index.d";

export default function relab<T>(model: RelabModel<T>) {
  try {
    const global = !model.namespace;

    check<T>(model);

    const action = createAction<T>(model, { getState, getAction });
    const reducer = createReducer<T>(model);

    const { namespace } = model;
    injectModel(namespace, reducer, action);

    return connect(
      (state: RelabStoreState) =>
        global
          ? {}
          : createStructuredSelector<RelabStoreState, any>({
              model: (o: RelabStoreState) => o[namespace]
            })(state),
      global
        ? () => {}
        : (dispatch: Dispatch) => bindActionCreators(action, dispatch)
    );
  } catch (err) {
    console.error(err);
  }
}
