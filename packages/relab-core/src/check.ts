import config from "./config";
import { RelabModel } from "../index.d";

const models: Record<string, any> = {};
const KEYS = ["namespace", "state", "reducers", "effects"];

export default function checkModel<T>(model: RelabModel<T>) {
  const hasNS = Object.prototype.hasOwnProperty.call(model, "namespace");

  if (!hasNS) {
    model.namespace = config.globalSpace;
  } else {
    if (process.env.NODE_ENV !== "production") {
      if (typeof model.namespace !== "string") {
        throw new Error("model namespace should be string!");
      }

      if (!model.namespace.match(/^(\w|-)+$/)) {
        throw new Error(
          `Only letters, numbers, and underscore characters are supported for the model namespace!`
        );
      }
    }
  }

  if (process.env.NODE_ENV !== "production") {
    if (models[model.namespace]) {
      if (model.namespace === config.globalSpace) {
        throw new Error(`Please do not reuse the global namespace!`);
      }

      throw new Error(
        `The model namespace '${model.namespace}' has been registered!`
      );
    }

    const p = Object.keys(model).filter(x => !KEYS.includes(x));

    if (p.length) {
      throw new Error(
        `Do not use the following invalid attributes in the model: ${p.join(
          ", "
        )}, only ${KEYS.map(x => `'${x}'`)} is supported in model now!`
      );
    }

    if (!(model.state instanceof Object)) {
      throw new Error(
        `The 'state' must be an object in the model namespace: ${model.namespace}!`
      );
    }

    if ("loading" in model.state) {
      throw new Error(
        `The 'loading' is a reserved keyword of 'state' object in the model namespace: ${model.namespace}!`
      );
    }

    if (model.reducers && !(model.reducers instanceof Object)) {
      throw new Error(
        `The 'reducers' must be an object in the model namespace: ${model.namespace}!`
      );
    }

    if (model.effects) {
      if (!(model.effects instanceof Object)) {
        throw new Error(
          `The 'effects' must be an object in the model namespace: ${model.namespace}!`
        );
      }

      const effect = Object.keys(model.effects).find(
        key => !key.match(/^[a-z](\w+)?$/i)
      );

      if (effect) {
        throw new Error(
          `The effect is a invalid name in the namespace: ${model.namespace}, Only letters, numbers, and underscore characters are supported for the effect name!`
        );
      }
    }
  }

  models[model.namespace] = model.namespace;
}
