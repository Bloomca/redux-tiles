import { get, isString } from 'lodash';
import { createType, ensureArray } from '../helpers';
import { ICreateSelectorsTypes, IData, ISelectors, SyncData } from './types';

export let DEFAULT_REDUCER: string = '';

export function changeDefaultReducer(newReducer: string): void {
  DEFAULT_REDUCER = newReducer;
}

function checkValue(result: any, defaultValue?: any): {} {
  return result === undefined ? defaultValue : result;
}

interface ILookupParams {
  selectorFallback: any;
  state: Object;
  params: any;
  nesting: ((params: any) => string[])|undefined;
  moduleName: string|string[];
}

/**
 * @overview Deep lookup inside state
 * @param  {Object} state – current redux state object
 * @param  {Any} params – argument with which action was dispatched
 * @param  {Function} nesting – function to create nested data inside store
 * @param  {String} moduleName – string to access module data
 * @return {Object} – stored data
 */
function lookup({ state, params, nesting, moduleName, selectorFallback }: ILookupParams): IData|SyncData {
  let path: string[] = [];
  const topReducer: string = DEFAULT_REDUCER;

  if (nesting) {
    path = nesting(params);
  }

  const nestedNames: string[] = ensureArray(moduleName);
  const topReducerArray: string[] = Boolean(topReducer) ? [topReducer] : [];

  return checkValue(get(state, [...topReducerArray, ...nestedNames, ...path]), selectorFallback);
}

interface ICheckArgumentsParams {
  state: {};
  params: any;
  moduleName: string|string[];
  fn: Function;
}

/**
 * @overview check passed arguments to the Selector function.
 * The single purpose is for readability, to throw sane error
 * @param  {Object} state – redux state
 * @param  {Any} params – argument with which action was dispatched
 * @param  {String} moduleName – string to access module data
 * @param  {Function} fn – function to invoke if check was passed
 * @return {Any} – result of function invokation
 */
function checkArguments({ state, params, moduleName, fn }: ICheckArgumentsParams): {} {
  if (!state) {
    throw new Error(`
      Error in Redux-Tiles Selector – you have to provide
      state as a first argument!. Error in "${createType({ type: moduleName })}" tile.`
    );
  }

  return fn(state, params);
}

/**
 * @overview function to create selectors for modules
 * @param  {String} moduleName – string to access module data
 * @param  {Function} nesting – function to create nested data inside store
 * @return {Object} – object with selectors for all and specific data
 */
export function createSelectors(
  { moduleName, nesting, selectorFallback }: ICreateSelectorsTypes
): ISelectors {
  const getAll: Function = (state: any): any => {
    const topReducerArray: string[] = Boolean(DEFAULT_REDUCER) ? [DEFAULT_REDUCER] : [];

    return checkValue(get(state, [...topReducerArray, ...ensureArray(moduleName)]));
  };

  const getSpecific: Function = (state: {}, params: any): IData|SyncData =>
    lookup({ state, params, nesting, moduleName, selectorFallback });

  return {
    getAll: (state: any): {} =>
      checkArguments({ state, moduleName, fn: getAll } as any),
    get: (state: any, params?: any): IData|SyncData =>
      checkArguments({ state, params, moduleName, fn: getSpecific })
  };
}
