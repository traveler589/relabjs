import { Store } from "redux";
import { AdvancedComponentDecorator } from "@types/react-redux";

/**
 * model狀態對象
 */
export type RelabState = {
  readonly [extraProps: string]: any;
};

/**
 * state 带 loading
 */
export type RelabModelState<T> = T & { loading: string[] };

/**
 * 觸發action時的可選選項
 */
export type RelabActionOption = {
  root: true;
};

/**
 * 整個store的狀態樹
 */
export type RelabStoreState = {
  [name: string]: Record<string, RelabState>;
};

/**
 * 自定義store對象
 */
export type RelabStore = {
  reset: (namespace?: string) => void;
  getState: (namespace?: string) => RelabState | RelabStoreState;
  dispatch: (action: RelabActionConfig | string, payload?: any) => void;
};

/**
 * 獲取狀態的函數
 */
interface RelabSelector {
  /**
   * 獲取狀態數據
   * @param namespace 命名空间（不写时获取所有状态数据）
   */
  (namespace?: string): Record<string, any>;
}

/**
 * action對象配置
 */
export interface RelabActionConfig {
  type: string;
  [extraProps: string]: any;
}

/**
 * effect參數對象
 */
export interface RelabEffectOption {
  /**
   * 获取状态数据
   */
  select: RelabSelector;
  /**
   * 触发reducer函数调用
   * @param reducer reducer函数的名称
   * @param payload 传给reducer函数的数据
   */
  commit(reducer: string, payload?: any): void;
  /**
   * 触发effect函数调用
   * @param effect effect函数的名称
   * @param params 传给effect函数的数据
   * @param option 选项
   */
  dispatch(effect: string, params?: any, option?: RelabActionOption): any;
}

/**
 * reducer函數
 */
export interface RelabReducer<T> {
  (state: T, payload?: any): T;
}

/**
 * effect函數
 */
export interface RelabEffect {
  (option: RelabEffectOption, params?: any): any;
}

/**
 * action內部用到的函數
 */
interface RelabActionHandler {
  /**
   * 获取状态数据
   */
  getState: RelabSelector;
  /**
   * 获取指定的action
   * @param action action类型，为对象类型时包含payload数据
   * @param payload 数据
   * @param option 选项
   */
  getAction(
    action: RelabActionConfig | string,
    payload?: any,
    option?: RelabActionOption
  ): RelabActionConfig;
}

/**
 * action函數
 */
export interface RelabAction {
  (payload?: any): any;
}

/**
 * model對象
 */
export interface RelabModel<T> {
  /**
   * 命名空间，必须唯一，不写时默认为全局
   */
  namespace: string;
  /**
   * 初始状态数据
   */
  state: T;
  /**
   * reducer 函数定义
   */
  reducers?: Record<string, RelabReducer<T>>;
  /**
   * effect 函数定义
   */
  readonly effects?: Record<string, RelabEffect>;
}

/**
 * model屬性
 */
export interface RelabProps<T> {
  model: RelabModelState<T>;
}

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__: any;
    __REDUX_DEVTOOLS_EXTENSION__OPTIONS: any;
  }
}

export const store: RelabStore;

export function initStore(state?: RelabStoreState): Store;

export default function relab<T>(
  model: RelabModel<T>
): AdvancedComponentDecorator;
