import { asyncAction, createResetAction, syncAction } from './actions';
import { createReducer } from './reducer';
import { createSelectors } from './selectors';
import { createType } from '../helpers';
import { AsyncActionTypes, SyncActionTypes, CreateSelectorsTypes } from './types';

const prefix = 'Redux_Tiles_';

export interface Types {
  [key:string]: string
}

export interface TileParams {
  type: string|string[],
  fn: Function,
  caching?: boolean,
  initialState?: any,
  nesting?: ((params: any) => string[])|undefined
}

export interface ReducerAction {
  payload: { data: any }|undefined,
  error: string|Object|undefined|null
}

const defaultState = {
  data: null,
  isPending: false,
  error: null
}

export function createTile(params: TileParams) {
  const { type, fn, caching, initialState = defaultState, nesting } = params;
  const identificator = createType({ type });
  const types: Types = {
    START: `${prefix}${identificator}_START`,
    SUCCESS: `${prefix}${identificator}_SUCCESS`,
    FAILURE: `${prefix}${identificator}_FAILURE`,
    RESET: `${prefix}${identificator}_RESET`
  };

  const selectorParams: CreateSelectorsTypes = {
    moduleName: type,
    nesting
  };

  const selectors = createSelectors(selectorParams);
  
  const actionParams: AsyncActionTypes = {
    START: types.START,
    SUCCESS: types.SUCCESS,
    FAILURE: types.FAILURE,
    fn,
    type,
    caching,
    nesting,
    selectors
  };
  const action = asyncAction.bind(null, actionParams);
  action.async = true;
  action.reset = createResetAction({ type: types.RESET });

  const reducer = createReducer(initialState, {
    [types.START]: {
      data: null,
      isPending: true,
      error: null
    },
    [types.ERROR]: (_storeState: any, storeAction: ReducerAction) => ({
      isPending: false,
      error: storeAction.error
    }),
    [types.SUCCESS]: (_storeState: any, storeAction: ReducerAction) => ({
      isPending: false,
      data: storeAction.payload && storeAction.payload.data
    }),
    [types.RESET]: initialState
  });

  return { action, reducer, selectors, moduleName: type, constants: types };
}

export interface SyncTileParams {
  type: string,
  nesting: ((params: any) => string[])|undefined,
  fn: Function,
  initialState: any,
}

export function createSyncTile(params: SyncTileParams) {
  const { type, nesting, fn, initialState = {} } = params;
  const identificator = createType({ type });
  const types = {
    TYPE: `${prefix}${identificator}type`,
    RESET: `${prefix}${identificator}reset`
  };

  const selectorParams: CreateSelectorsTypes = {
    moduleName: type,
    nesting
  };
  const selectors = createSelectors(selectorParams);

  const action: any = syncAction({
    TYPE: types.TYPE,
    nesting,
    fn
  } as SyncActionTypes);

  const reducer = createReducer(initialState, {
    [types.TYPE]: (_storeState: any, storeAction: ReducerAction) => storeAction.payload && storeAction.payload.data
  });
  
  action.reset = createResetAction({ type: types.RESET });

  return { action, selectors, reducer, moduleName: type, constants: types };
}