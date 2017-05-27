import { combineReducers, Reducer } from 'redux';
import { isString, isFunction } from 'lodash';
import { iterate, populateHash } from './helpers';
import { Tile } from './modules/types';

export function createNestedReducers(value: any) {
  return combineReducers(Object.keys(value).reduce((hash: any, key: string) => {
    const elem = value[key];
    hash[key] = isFunction(elem) ? elem : createNestedReducers(elem);
    return hash;
  }, {}));
}

export function createReducers(modules: Tile[]) {
  const nestedModules = iterate(modules).reduce((hash, module: Tile) => {
    populateHash(hash, module.moduleName, module.reducer);
    return hash;
  }, {});

  return createNestedReducers(nestedModules);
}