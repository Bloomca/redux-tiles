import { get, isString } from 'lodash';
import { CreateSelectorsTypes } from './types';
import { ensureArray } from '../helpers';

export const DEFAULT_REDUCER = 'redux_tiles';

interface LookupParams {
  topReducer: string,
  state: Object,
  params: any,
  nesting: ((params: any) => string[])|undefined,
  moduleName: string|string[]
}

/**
 * @overview Deep lookup inside state
 * @param  {Object} state – current redux state object
 * @param  {Any} params – argument with which action was dispatched
 * @param  {Function} nesting – function to create nested data inside store
 * @param  {String} moduleName – string to access module data
 * @return {Object} – stored data
 */
function lookup({ topReducer, state, params, nesting, moduleName }: LookupParams) {
  let path: string[] = [];

  if (nesting) {
    path = nesting(params);
  }
  
  const nestedNames = isString(moduleName) ? [moduleName] : moduleName;
  return get(state, [topReducer, ...nestedNames, ...path]) || {};
}

interface CheckArgumentsParams {
  topReducer: string,
  state: Object,
  params: any,
  moduleName: string|string[]
  fn: Function
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
function checkArguments({ topReducer, state, params, moduleName, fn }: CheckArgumentsParams) {
  if (!state) {
    throw new Error(`Error in MODULES Selector – you have to provide state as a first argument!. Error in "${moduleName}" module.`);
  }

  return fn(topReducer, state, params);
}

/**
 * @overview function to create selectors for modules
 * @param  {String} moduleName – string to access module data
 * @param  {Function} nesting – function to create nested data inside store
 * @return {Object} – object with selectors for all and specific data
 */
export function createSelectors({ moduleName, nesting }: CreateSelectorsTypes) {
  const getAll = (topReducer = DEFAULT_REDUCER, state: any) => {
    return get(state, [topReducer, ...ensureArray(moduleName)]) || {};
  };
  
  const getSpecific = (topReducer = DEFAULT_REDUCER, state: any, params: any) => lookup({ topReducer, state, params, nesting, moduleName });
  return {
    getAll: (topReducer: string, state: any) => checkArguments({ topReducer, state, moduleName, fn: getAll } as any),
    get: (topReducer: string, state: any, params: any) => checkArguments({ topReducer, state, params, moduleName, fn: getSpecific })
  };
}
