import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import check from "./check";
import createAction from "./action";
import createReducer from "./reducer";
import { injectModel, getState } from "./store";

const models = {};

export default function relab(model) {
  check(model, models);

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
