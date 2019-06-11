const KEYS = ["namespace", "state", "reducers", "effects"];

export default function checkModel(model, models) {
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
