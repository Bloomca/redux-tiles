import { isFunction, isString } from 'lodash';
import { combineReducers, Reducer } from 'redux';
import { iterate, populateHash } from './helpers';
import { changeDefaultReducer, DEFAULT_REDUCER } from './tiles/selectors';
import { ITile } from './tiles/types';

export function createNestedReducers(value: any): Reducer<any> {
  return combineReducers(Object.keys(value).reduce((hash: any, key: string) => {
    const elem: Function|{} = value[key];
    hash[key] = isFunction(elem) ? elem : createNestedReducers(elem);

    return hash;
  }, {}));
}

export function createReducers(modules: ITile[], topReducer: string = DEFAULT_REDUCER): Reducer<any> {
  if (topReducer !== DEFAULT_REDUCER) {
    changeDefaultReducer(topReducer);
  }

  const nestedModules: any = iterate(modules).reduce((hash: any, module: ITile) => {
    populateHash(hash, module.tileName, module.reducer);

    return hash;
  }, {});

  return createNestedReducers(nestedModules);
}
