import { bindActionCreators } from "redux";
import prefix from "./prefix";

export default function createAction(model, getState) {
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
