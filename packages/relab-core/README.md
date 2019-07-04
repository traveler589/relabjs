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

`namespace` 指定了 `model` 的唯一 `key` 值，不指定时可以当作全局 `model`（namespace 已内置为 `$global`），全局 `model` 只可以定义一次，通常用于存放全局数据，如登录的用户信息等，如非必要，不建议使用。

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

3. `dispatch`：仅用于调用 `effect` 函数，最多支持 3 个参数，有多种用法（此处调用需要特别注意的是，不要互相调用形成闭环以免造成死循环）：

   （1）触发当前 `effects` 内定义的其他 `effect` 函数，如：

   ```js
   dispatch("pull", { id: 1 });

   // 或者

   dispatch({
     type: "pull",
     id: 1
   });
   ```

   （2）触发其他 `model` 里面 `effects` 内定义的 `effect` 函数，如：

   ```js
   dispatch("home/pull", { id: 1 });

   // 或者

   dispatch({
     type: "home/pull",
     id: 1
   });
   ```

   （3）触发全局 `model` 里面 `effects` 内定义的 `effect` 函数，如：

   ```js
   dispatch("pull", { id: 1 }, { root: true });

   // 或者

   dispatch(
     {
       type: "home/pull",
       id: 1
     },
     {
       root: true
     }
   );
   ```

> 注意：触发其他 `model` 内的 `effect` 函数时，有可能因为 `model` 未加载而报错，所以不是在很有必要的情况下，不建议使用。

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

如有全局状态，建议在引用全局 `Router` 的组件内引入。全局状态只用于数据的存放和读取，为减少不必要的渲染，不要连接到组件上。

```js
import React, { lazy, Suspense } from "react";
import { Route, Router, Switch } from "react-router-dom";
import { createBrowserHistory } from "history";
import Loading from "@/loading";
import relab, { store } from "@relabjs/core";
import model from "./model";

const history = createBrowserHistory();

const Layout = lazy(() => import("^/index"));

// 全局数据仅用于初始化
relab(model);

const App = () => {
  // 设置状态数据
  // store.dispatch("pushUser", user);
  // 获取状态数据
  // store.getState()

  return (
    <Router history={history}>
      <Suspense fallback={<Loading />}>
        <Switch>
          <Route path="/" component={Layout} />
        </Switch>
      </Suspense>
    </Router>
  );
};

export default App;
```

### 组件内使用：

```js
import React, { PureComponent } from "react";
import relab from "@relabjs/core";
import model from "./model";

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

### 组件内触发或获取状态：

```js
import { store } from "@relabjs/core";

// 触发指定model的effect函数
store.dispatch("home/pull", { id: 1 });
// 或者
store.dispatch({
  type: "home/pull",
  id: 1
});

// 触发全局model的effect函数
store.dispatch("pull", { id: 1 });
// 或者
store.dispatch({
  type: "pull",
  id: 1
});

// 获取指定model的状态
store.getState("home");
// 或者
store.getState().home;

// 获取所有的状态数据
store.getState();

// 获取全局model的状态数据
store.getState("$global");
```

### 重置状态数据

> 注意：此处说的重置状态数据是指把数据状态重置为初始定义时的状态，并非把所有状态数据清空。

某些场合下（如退出登录时）可能需要重置状态数据，可以按如下操作：

```js
import React, { PureComponent } from "react";
import { store } from "@relabjs/core";

class Layout extends PureComponent {
  logout() {
    // 重置所有状态
    store.reset();
    // 重置指定 model 的状态
    store.reset("home");
  }
}
```

> 说明：`store` 的 `reset` 方法可以传入一个 `namespace` 的值作为参数来重置指定模块的状态数据，不传或传入不合法的参数时重置所有状态数据。

### 使用 typescript

#### model 定义

```js
// 引入类型变量
import { RelabEffectOption } from "relabjs/core";

// 定义并输出状态类型
export interface ModelState {
  offset: number;
}

export default {
  namespace: "home",
  state: {
    offset: 0
  },
  reducers: {
    "set/offset"(state: ModelState, offset: number) {
      return {
        ...state,
        offset
      };
    }
  },
  effects: {
    scroll({ commit }: RelabEffectOption, offset = 0) {
      commit("set/offset", offset);
    }
  }
};
```

#### 组件内使用

```js
import React, { PureComponent } from "react";
import { RouteComponentProps } from "react-router-dom";
import relab, { RelabProps } from "relabjs/core";
import model, { ModelState } from "./model";

interface Props extends RouteComponentProps, RelabProps<ModelState> {
  scroll(x: number): void;
}

class Home extends PureComponent<Props> {
  render() {
    return <h2>Hello</h2>;
  }
}

export default relab(model)(Home);
```

## 其他

每个 `model` 定义时会默认在 `state` 中注入 `loading` 属性，默认值为空数组，执行每个 `effect` 函数时，会自动往 `loading` 数组加入当前执行的函数名，执行完成后会自动移除，因此可以通过判断 `loading` 数组的长度是否为 0 来判断当前 `effect` 是否执行完成。
