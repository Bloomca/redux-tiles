import { Dispatch, Action } from 'redux';
import { PromiseObject } from './modules/types';
import { waitTiles } from './waitTiles';

export function createMiddleware(paramsToInject = {}) {
  const promisesStorage: PromiseObject = {};

  const middleware = (
    { dispatch, getState }: { dispatch: Dispatch<any>, getState: () => any }
  ) => (next: Function) => (action: Action) => {
    if (typeof action === 'function') {
      return action({ dispatch, getState, promisesStorage, ...paramsToInject });
    }

    return next(action);
  };

  return {
    middleware,
    waitTiles: waitTiles.bind(null, promisesStorage)
  };
}
