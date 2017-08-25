import { Action, Reducer } from 'redux';
import { get, isFunction, mapValues } from '../utils';
import { ReducerObject } from './types';

/**
 * @overview create reducer function from the object
 * @param  {Any} initialState – initial state of this part of the store
 * @param  {Object} handlers – object with keys as action types, and
 * reduce functions to change store as values
 * @return {Function} – function to act as a reducer
 */
export function createReducerFromObject(initialState: any, handlers: ReducerObject): Reducer<any> {
  return function reducer(state: {} = initialState, action: Action): {} {
    const handler: Function|{} = handlers[action.type];

    return typeof handler === 'function' ? handler(state, action) : state;
  };
}

/**
 * @overview create reducer from the object, with creating reducing functions
 * @param  {Any} initialState – initial state of this part of the store
 * @param  {Object} handlers – object with keys as action types, and
 * newValues to set at store as values
 * @return {Function} – function to act as a reducer
 */
export function createReducer(initialState: any, handlers: ReducerObject): Reducer<any> {
  return createReducerFromObject(
    initialState,
    mapValues(handlers, (value: any) => (state: any, action: Action): any => reducerCreator({
      state,
      action,
      newValue: isFunction(value) ? value(state, action) : value
    }))
  );
}

/**
 * @overview reducer function, which changes the state with new values
 * @param  {Object} action – reducer action object, with type and payload
 * @param  {Object} state – previous redux state in this branch
 * @param  {Any} newValue – new value to set up in state in corresponding path
 * @return {Object} – changed reducer
 */
export function reducerCreator({ action, state, newValue }: any): any {
  const { path } = action.payload;

  const hasNoNestInStore: boolean = !path;
  if (hasNoNestInStore) {
    return newValue;
  }

  let result: any = {};
  let lookupPath: string[];

  const length: number = path.length;
  for (let i: number = length - 1; i >= 0; i = i - 1) {
    const el: string = path[i];
    const isLastItem: boolean = i === path.length - 1;
    const newNestedResult: any = {
      [el]: isLastItem ? newValue : result
    };
    lookupPath = path.slice(0, i);
    const oldState: any = get(state, lookupPath) || {};
    result = {
      ...oldState,
      ...newNestedResult
    };
  }

  return {
    ...state,
    ...result
  };
}
