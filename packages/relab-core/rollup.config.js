const babel = require("rollup-plugin-babel");
const resolve = require("rollup-plugin-node-resolve");
const typescript = require("rollup-plugin-typescript");

const config = {
  input: "src/index.ts",
  plugins: [
    typescript(),
    resolve(),
    babel({
      babelrc: false,
      exclude: "node_modules/**"
    })
  ],
  external: ["lodash", "redux", "reselect", "react-redux", "redux-thunk"]
};

module.exports = [
  // commonjs
  {
    ...config,
    output: {
      file: "dist/index.js",
      format: "cjs",
      exports: "named"
    }
  },
  // ES
  {
    ...config,
    output: {
      file: "es/index.js",
      format: "es",
      exports: "named"
    }
  }
];
