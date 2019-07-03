import { Dispatch } from "redux";
import prefix from "./prefix";
import {
  RelabModel,
  RelabActionOption,
  RelabActionConfig,
  RelabActionHandler
} from "../index.d";

export default function createAction<T>(
  model: RelabModel<T>,
  { getState, getAction }: RelabActionHandler
) {
  const { namespace, effects } = model;

  return effects
    ? Object.keys(effects).reduce((o: Record<string, Function>, k) => {
        o[k] = (args: any) => (dispatch: Dispatch) => {
          dispatch({
            payload: k,
            type: prefix.reducer(namespace, "@@start")
          });

          const handler = {
            select: getState,
            commit(type: string, payload: any) {
              dispatch({
                payload,
                type: prefix.reducer(namespace, type)
              });
            },
            dispatch(
              action: RelabActionConfig | string,
              payload: any,
              option: RelabActionOption
            ) {
              if (!action || typeof action !== "string") {
                throw new Error(
                  "The dispatch function first parameter must be a non-empty string!"
                );
              }

              const global = option instanceof Object && option.root === true;
              const sibling = action.split("/").length > 1;

              if (!sibling && !global) {
                if (typeof effects[action] === "function") {
                  return effects[action](handler, payload);
                }

                throw new Error(
                  `The effect '${action}' is not defined in current model!`
                );
              }

              return dispatch(getAction(action, payload, option));
            }
          };

          return Promise.resolve(effects[k](handler, args)).then(ret => {
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
}
