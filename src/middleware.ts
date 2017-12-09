import { Action, Dispatch, Middleware } from "redux";
import { IPromiseObject } from "./tiles/types";
import { waitTiles } from "./waitTiles";

export function createMiddleware(
  paramsToInject: any = {}
): { middleware: Middleware; waitTiles: Function } {
  const promisesStorage: IPromiseObject = {};

  const middleware: Middleware = ({
    dispatch,
    getState
  }: {
    dispatch: Dispatch<any>;
    getState(): any;
  }): ((next: Dispatch<any>) => Dispatch<any>) => (
    next: Dispatch<any>
  ): Dispatch<any> => (action: Action): any => {
    if (typeof action === "function") {
      return action({ dispatch, getState, promisesStorage, ...paramsToInject });
    }

    return next(action);
  };

  return {
    middleware,
    waitTiles: waitTiles.bind(null, promisesStorage)
  };
}
