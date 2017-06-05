import { createActions } from './createActions';
import { createReducers } from './createReducers';
import { createSelectors } from './createSelectors';
import { ITile } from './modules/types';

export function createEntities(tiles: ITile[], topReducer?: string): any {
  return {
    actions: createActions(tiles),
    reducer: createReducers(tiles, topReducer),
    selectors: createSelectors(tiles)
  };
}
