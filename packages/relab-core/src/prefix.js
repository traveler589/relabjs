import config from "./config";

const concat = (type, namespace, name) => {
  const ret = `${namespace}${name ? `/${name}` : ""}`;

  return `${config[type]}/${ret}`;
};

export default {
  reducer(namespace, name) {
    return concat("reducerPrefix", namespace, name);
  },
  effect(namespace, name) {
    return concat("effectPrefix", namespace, name);
  }
};
