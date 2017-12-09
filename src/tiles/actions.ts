import { Dispatch } from "redux";
import { createType, ensureArray } from "../helpers";
import { getTopReducer } from "./selectors";
import { IAsyncActionTypes, IPromiseObject, ISyncActionTypes } from "./types";

interface IProcessedMiddleware {
  dispatch: Dispatch<{}>;
  getState(): {};
  [key: string]: any;
}

export type FnResult = (params: any, additionalParams?: any) => any;

function proccessMiddleware(args: any[]): IProcessedMiddleware {
  if (args.length === 3) {
    // let's assume it is redux-thunk with extra argument
    return { dispatch: args[0], getState: args[1], ...args[2] };
  } else if (args.length === 2) {
    // likely it is redux-thunk
    return { dispatch: args[0], getState: args[1] };
  } else if (args.length === 1 && typeof args[0] === "object") {
    // our own middleware
    return args[0];
  }

  // no idea what it is
  throw new Error("Redux-Tiles expects own middleware, or redux-thunk");
}

export function shouldBeFetched({ isPending, fetched, error }: any): boolean {
  // if it is pending, then we have to wait anyway
  if (isPending) {
    return false;
  }

  // in case it was not fetched yet, we have to fetch it for the first time
  if (fetched === false) {
    return true;
  }

  // and if error is not null or undefined, we have to re-fetch it again
  if (error != null) {
    return true;
  }

  return false;
}

function handleMiddleware(fn: Function): FnResult {
  return (fnParams: any, additionalParams: any): Function => (
    ...args: any[]
  ): any => fn(proccessMiddleware(args), fnParams, additionalParams);
}

export function asyncAction({
  START,
  SUCCESS,
  FAILURE,
  fn,
  type,
  caching,
  nesting,
  selectors
}: IAsyncActionTypes): FnResult {
  return handleMiddleware(
    (
      {
        dispatch,
        getState,
        promisesStorage = {},
        ...middlewares
      }: {
        dispatch: Dispatch<{}>;
        promisesStorage: IPromiseObject;
        getState(): {};
      },
      params: any,
      { forceAsync }: { forceAsync?: boolean } = {}
    ) => {
      const path: string[] | null = nesting ? nesting(params) : null;

      const getIdentificator: string = createType({ type, path });

      if (caching) {
        const activePromise: Promise<any> | undefined =
          promisesStorage[getIdentificator];

        if (activePromise) {
          return activePromise;
        }
      }

      if (caching && !forceAsync) {
        const { isPending, fetched, error, data } = selectors.get(
          getState(),
          params
        );
        const isFetchingNeeded: boolean = shouldBeFetched({
          isPending,
          fetched,
          error
        });

        if (!isFetchingNeeded) {
          return Promise.resolve({ data, error, isPending });
        }
      }

      dispatch({
        type: START,
        payload: { path },
        isPending: true
      });

      const promise: Promise<any> = fn({
        params,
        dispatch,
        getState,
        ...middlewares
      })
        .then((data: any) => {
          promisesStorage[getIdentificator] = undefined;
          return dispatch({
            type: SUCCESS,
            payload: { path, data },
            data,
            isPending: false
          });
        })
        .catch((error: any) => {
          promisesStorage[getIdentificator] = undefined;
          return dispatch({
            error,
            type: FAILURE,
            payload: { path },
            isPending: false
          });
        });

      promisesStorage[getIdentificator] = promise;

      return promise;
    }
  );
}

export function createResetAction({ type }: { type: string }): Function {
  return handleMiddleware(({ dispatch }: { dispatch: Dispatch<any> }) =>
    dispatch({ type })
  );
}

export function syncAction({
  SET,
  fn,
  nesting,
  type
}: ISyncActionTypes): FnResult {
  return handleMiddleware(
    ({ dispatch, getState, selectors, ...middlewares }: any, params: any) => {
      const path: string[] | null = nesting ? nesting(params) : null;

      const topReducer = getTopReducer();
      const nestedNames: string[] = ensureArray(type);
      const topReducerArray: string[] = Boolean(topReducer) ? [topReducer] : [];

      const selectorFn = topReducerArray
        .concat(nestedNames)
        .reduce((selectors, key) => selectors[key], selectors);

      const getData = () => selectorFn(getState(), params);
      const data = fn({ params, dispatch, getData, getState, ...middlewares });

      return dispatch({
        type: SET,
        payload: {
          path,
          data
        },
        data
      });
    }
  );
}
