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
  const {
    type,
    fn,
    caching,
    nesting,
    selectorFallback = null
  } = params;
  // initial state is equal to empty object, because of possible nesting
  // basically every object should contain default properties, so we handle
  // this situation using selectors
  const initialState: any = nesting ? {} : null;
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
      data: selectorFallback,
      fetched: false,
    },
    tileName: type,
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
      error: null,
      fetched: false,
    },
    [types.FAILURE]: (_storeState: {}, storeAction: IReducerAction): IData => ({
      data: null,
      isPending: false,
      error: storeAction.error,
      fetched: true,
    }),
    [types.SUCCESS]: (_storeState: {}, storeAction: IReducerAction): IData => ({
      error: null,
      isPending: false,
      data: storeAction.payload && storeAction.payload.data,
      fetched: true,
    }),
    [types.RESET]: initialState
  };
  const reducer: Reducer<any> = createReducer(initialState, reducerObject);

  return { action, reducer, selectors, tileName: type, constants: types, reflect: params };
}

export function createSyncTile(params: ISyncTileParams): ITile {
  const {
    type,
    nesting,
    fn = (fnParams: any): any => fnParams.params,
    fns,
    // we have default state as an object because of the possible nesting
    initialState = nesting ? {} : null,
    selectorFallback
  } = params;
  const identificator: string = createType({ type });
  const types: ITypes = {
    SET: `${prefix}${identificator}_SET`,
    RESET: `${prefix}${identificator}_RESET`
  };

  const selectorParams: ICreateSelectorsTypes = {
    selectorFallback,
    tileName: type,
    nesting
  };
  const selectors: ISelectors = createSelectors(selectorParams);

  const actionParams: ISyncActionTypes = {
    SET: types.SET,
    nesting,
    fn
  };
  const action: IOverloadedAction = syncAction(actionParams);
  action.reset = createResetAction({ type: types.RESET });

  if (fns) {
    Object.keys(fns).forEach((methodName: string) => {
      const method: any = fns[methodName];
      const customActionParams: ISyncActionTypes = {
        ...actionParams,
        fn: method
      };
      action[methodName] = syncAction(customActionParams);
    });
  }

  const reducerObject: ReducerObject = {
    [types.SET]: (_storeState: {}, storeAction: IReducerAction): SyncData =>
      storeAction.payload && storeAction.payload.data,
    [types.RESET]: initialState
  };
  const reducer: Reducer<any> = createReducer(initialState, reducerObject);

  return { action, selectors, reducer, tileName: type, constants: types, reflect: params };
}
