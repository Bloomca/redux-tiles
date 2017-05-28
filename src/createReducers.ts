import { combineReducers, Reducer } from 'redux';
import { isString, isFunction } from 'lodash';
import { iterate, populateHash } from './helpers';
import { Tile } from './modules/types';
import { DEFAULT_REDUCER, changeDefaultReducer } from './modules/selectors';

export function createNestedReducers(value: any) {
  return combineReducers(Object.keys(value).reduce((hash: any, key: string) => {
    const elem = value[key];
    hash[key] = isFunction(elem) ? elem : createNestedReducers(elem);
    return hash;
  }, {}));
}

export function createReducers(modules: Tile[], topReducer = DEFAULT_REDUCER) {
  if (topReducer !== DEFAULT_REDUCER) {
    changeDefaultReducer(topReducer);
  }
  
  const nestedModules = iterate(modules).reduce((hash, module: Tile) => {
    populateHash(hash, module.moduleName, module.reducer);
    return hash;
  }, {});

  return createNestedReducers(nestedModules);
}