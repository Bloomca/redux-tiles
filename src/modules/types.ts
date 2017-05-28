export interface OverloadedAction {
  (params?: any, additionalParams?: any): any,
  reset?: Function
}

export interface Tile {
  moduleName: string|string[],
  action: OverloadedAction,
  reducer: Function,
  selectors: {
    get: Function,
    getAll: Function,
  },
  constants: {
    [key:string]: string
  },
  reflect: TileParams|SyncTileParams
}

export interface TileParams {
  type: string|string[],
  fn: Function,
  caching?: boolean,
  initialState?: any,
  nesting?: ((params: any) => string[])|undefined,
  selectorFallback?: any
}

export interface SyncTileParams {
  type: string|string[],
  fn?: Function,
  nesting?: ((params: any) => string[])|undefined,
  initialState?: any,
  selectorFallback?: any
}

export interface AsyncActionTypes {
  type: string|string[],
  START: string,
  SUCCESS: string,
  FAILURE: string,
  fn: Function,
  caching?: boolean,
  nesting?: Function|undefined,
  selectors: {
    get: Function
  }
}

export interface SyncActionTypes {
  TYPE: string,
  fn: Function,
  nesting: ((params: any) => string[])|undefined
}

export interface PromiseObject {
  [key:string]: Promise<any>|undefined
}

export interface CreateSelectorsTypes {
  moduleName: string|string[]
  nesting: ((params: any) => string[])|undefined,
  selectorFallback: any
}