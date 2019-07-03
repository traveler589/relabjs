import config from './config';

const concat = (type: 'reducerPrefix' | 'effectPrefix', namespace: string, name?: string) => {
  const ret = `${namespace}${name ? `/${name}` : ''}`;

  return `${config[type]}/${ret}`;
};

export default {
  reducer(namespace: string, name?: string) {
    return concat('reducerPrefix', namespace, name);
  },
  effect(namespace: string, name?: string) {
    return concat('effectPrefix', namespace, name);
  }
};
