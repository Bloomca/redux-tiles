import { Dispatch, Action } from 'redux'

export function createMiddleware(paramsToInject = {}) {
  return ({ dispatch, getState }: { dispatch: Dispatch<any>, getState: () => any }) => (next: Function) => (action: Action) => {
    if (typeof action === 'function') {
      return action({ dispatch, getState, ...paramsToInject });
    }

    return next(action);
  };
}
