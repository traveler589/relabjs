# relab-core

## 介绍

`relab-core` 是整合了 `redux`、`redux-thunk`、`react-redux` 的简单 js 库，使用方式类似 `vuex`。

## 安装

```sh
npm i @relabjs/core
yarn add @relabjs/core
```

## 用法

### 项目入口文件：

```js
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { initStore } from "@relabjs/core";
import App from "./App";

const store = initStore();

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("app")
);
```

### 模块 `model` 文件：

```js
export default {
  // 命名空间，必须唯一
  namespace: "home",
  // 初始数据
  state: {
    list: [],
    offset: 0
  },
  // reducer
  reducers: {
    "push/list"(state, list) {
      return {
        ...state,
        list
      };
    },
    "set/offset"(state, offset) {
      return {
        ...state,
        offset
      };
    }
  },
  // effect
  effects: {
    pull({ select, commit }) {
      return new Promise(resolve => {
        // 此处为获取 news 模块的状态数据
        const { list } = select("news");

        commit(list);
        resolve();
      });
    },
    scroll({ commit }, offset = 0) {
      commit("set/offset", offset);
    }
  }
};
```

#### 注意：

> 1. `effects` 里面可以进行异步操作（如请求数据等），异步操作必须使用 `promise` 或 `async` 语法，使用 `promise` 时，必须返回 `promise` 对象。
> 2. `effects` 里面声明的函数参数个数不限定，第一个参数固定为对象 `{ commit, select, dispatch }`，其他参数由调用 `effect` 函数时传入。

#### 参数说明：

1. `commit`：调用 `reducer` 函数，支持两个参数，第一个参数为 `reducers` 里面声明的函数名，第二个参数为 `payload`，即 `reducer` 函数的第二个参数。

2. `select`：可以获取状态树的数据，传入指定的 `model` 的 `namespace` 值作为参数时可以获取该 `model` 的状态数据，不传参数时获取的是整个状态树的数据。

3. `dispatch`：仅用于调用 `effect` 函数，参数个数不限定，第一个参数为 `effects` 里面声明的函数名，其他参数会作为 `effect` 函数除第一个参数以外的其他参数传入，此处调用需要特别注意的是，不要互相调用以免造成死循环。

### 连接组件（建议组件跟 `model` 文件放在一起，便于引入使用）：

```js
import React, { PureComponent } from "react";
import relab from "@relabjs/core";
import model from "./model";

// 可以使用修饰器的形式
@relab(model)
export default class Home extends PureComponent {
  render(){
    return (
      ...
    )
  }
}

// 也可以使用高阶函数形式
class Home extends PureComponent {
  render(){
    return (
      ...
    )
  }
}

export default relab(model)(Home);
```

### 组件内使用：

```js
import React, { PureComponent } from "react";
import relab from "@relabjs/core";
import model from "./model";

// 可以使用修饰器的形式
@relab(model)
export default class Home extends PureComponent {
  componentDidMount() {
    // 此处 pull 为定义在 `effects` 里面的同名函数
    const { pull } = this.props;

    // 获取数据
    pull();
  }
  render() {
    // 模块的状态数据被注入到名称为 `model` 的属性对象里。
    const { list, offset, loading } = this.props.model;

    if (loading.length) {
      return <p>正在载入...</p>;
    }

    return (
      <ul>
        {list.map(o => (
          <li key={o.id}>{o.name}</li>
        ))}
      </ul>
    );
  }
}
```

### 重置状态数据

> 注意：此处说的重置状态数据是指把数据状态重置为初始定义时的状态，并非把所有状态数据清空。

某些场合下（如退出登录时）可能需要重置状态数据，可以按如下操作：

```js
import React, { PureComponent } from "react";
import { getStore } from "@relabjs/core";

class Layout extends PureComponent {
  logout() {
    // 调用 getStore() 可以得到 `store` 对象
    getStore().reset();
  }
}
```

> 说明：`store` 的 `reset` 方法可以传入一个 `namespace` 的值作为参数来重置指定模块的状态数据，不传或传入不合法的参数时重置所有状态数据。

## 其他

每个 `model` 定义时会默认在 `state` 中注入 `loading` 属性，默认值为空数组，执行每个 `effect` 函数时，会自动往 `loading` 数组加入当前执行的函数名，执行完成后会自动移除，因此可以通过判断 `loading` 数组的长度是否为 0 来判断当前 `effect` 是否执行完成。
