import { identity } from 'lodash';
import { Reducer } from 'redux';
import { createType } from '../helpers';
import { asyncAction, createResetAction, syncAction } from './actions';
import { createReducer } from './reducer';
import { createSelectors } from './selectors';
import {
  IAsyncActionTypes,
  ICreateSelectorsTypes,
  IData,
  IOverloadedAction,
  ISelectors,
  ISyncActionTypes,
  ISyncTileParams,
  ITile,
  ITileParams,
  ReducerObject,
  SyncData
} from './types';

const prefix: string = 'Redux_Tiles_';

export interface ITypes {
  [key: string]: string;
}

export interface IReducerAction {
  payload: { data: any }|undefined;
  error: string|Object|undefined|null;
}

export function createTile(params: ITileParams): ITile {
  const { type, fn, caching, initialState = {}, nesting, selectorFallback = null } = params;
  const identificator: string = createType({ type });
  const types: ITypes = {
    START: `${prefix}${identificator}_START`,
    SUCCESS: `${prefix}${identificator}_SUCCESS`,
    FAILURE: `${prefix}${identificator}_FAILURE`,
    RESET: `${prefix}${identificator}_RESET`
  };

  const selectorParams: ICreateSelectorsTypes = {
    selectorFallback: {
      isPending: false,
      error: null,
      data: selectorFallback
    },
    moduleName: type,
    nesting
  };

  const selectors: ISelectors = createSelectors(selectorParams);

  const actionParams: IAsyncActionTypes = {
    START: types.START,
    SUCCESS: types.SUCCESS,
    FAILURE: types.FAILURE,
    fn,
    type,
    caching,
    nesting,
    selectors
  };
  const action: IOverloadedAction = asyncAction(actionParams);
  action.reset = createResetAction({ type: types.RESET });

  const reducerObject: ReducerObject = {
    [types.START]: {
      data: null,
      isPending: true,
      error: null
    },
    [types.ERROR]: (_storeState: {}, storeAction: IReducerAction): IData => ({
      data: null,
      isPending: false,
      error: storeAction.error
    }),
    [types.SUCCESS]: (_storeState: {}, storeAction: IReducerAction): IData => ({
      error: null,
      isPending: false,
      data: storeAction.payload && storeAction.payload.data
    }),
    [types.RESET]: initialState
  };
  const reducer: Reducer<any> = createReducer(initialState, reducerObject);

  return { action, reducer, selectors, moduleName: type, constants: types, reflect: params };
}

export function createSyncTile(params: ISyncTileParams): ITile {
  const { type, nesting, fn = identity, initialState = {}, selectorFallback } = params;
  const identificator: string = createType({ type });
  const types: ITypes = {
    TYPE: `${prefix}${identificator}type`,
    RESET: `${prefix}${identificator}reset`
  };

  const selectorParams: ICreateSelectorsTypes = {
    selectorFallback,
    moduleName: type,
    nesting
  };
  const selectors: ISelectors = createSelectors(selectorParams);

  const actionParams: ISyncActionTypes = {
    TYPE: types.TYPE,
    nesting,
    fn
  };
  const action: IOverloadedAction = syncAction(actionParams);

  const reducerObject: ReducerObject = {
    [types.TYPE]: (_storeState: {}, storeAction: IReducerAction): SyncData =>
      storeAction.payload && storeAction.payload.data,
    [types.RESET]: initialState
  };
  const reducer: Reducer<any> = createReducer(initialState, reducerObject);

  action.reset = createResetAction({ type: types.RESET });

  return { action, selectors, reducer, moduleName: type, constants: types, reflect: params };
}
