export type ReducerObject = { [key: string]: Function|Object };

export interface IOverloadedAction {
  (params?: any, additionalParams?: any): any;
  [key: string]: any;
}

export interface ITile {
  tileName: string|string[];
  action: IOverloadedAction;
  reducer: Function;
  selectors: {
    get: Function;
    getAll: Function;
  };
  constants: {
    [key: string]: string
  };
  reflect: ITileParams|ISyncTileParams;
}

export interface ITileParams {
  type: string|string[];
  fn: Function;
  caching?: boolean;
  initialState?: any;
  nesting?: ((params: any) => string[])|undefined;
  selectorFallback?: any;
}

export interface ISyncTileParams {
  type: string|string[];
  fn?: Function;
  fns?: { [key: string]: (params?: any, additionalParams?: any) => any };
  nesting?: ((params: any) => string[])|undefined;
  initialState?: any;
  selectorFallback?: any;
}

export interface IAsyncActionTypes {
  type: string|string[];
  START: string;
  SUCCESS: string;
  FAILURE: string;
  fn: Function;
  caching?: boolean;
  nesting?: Function|undefined;
  selectors: {
    get: Function;
  };
}

export interface ISyncActionTypes {
  SET: string;
  fn: Function;
  nesting: ((params: any) => string[])|undefined;
}

export interface IPromiseObject {
  [key: string]: Promise<any>|undefined;
}

export interface ICreateSelectorsTypes {
  tileName: string|string[];
  nesting: ((params: any) => string[])|undefined;
  selectorFallback: any;
}

export interface IData {
  isPending: boolean;
  error: any;
  data: any;
  fetched: boolean;
}

export type SyncData = any;

export interface ISelectors {
  get(state: any, params?: any): IData|SyncData;
  getAll(state: any): {};
}
