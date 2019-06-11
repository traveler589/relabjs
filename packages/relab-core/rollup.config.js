const babel = require("rollup-plugin-babel");
const resolve = require("rollup-plugin-node-resolve");

module.exports = {
  input: "src/index.js",
  output: {
    file: "dist/index.js",
    format: "es"
  },
  plugins: [
    resolve(),
    babel({
      babelrc: false,
      exclude: "node_modules/**"
    })
  ],
  external: ["lodash", "redux", "reselect", "react-redux", "redux-thunk"]
};
