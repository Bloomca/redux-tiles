import { createActions } from './createActions';
import { createSelectors } from './createSelectors';
import { createReducers } from './createReducers';
import { Tile } from './modules/types';

export function createEntities(tiles: Tile[], topReducer?: string): any {
  return {
    actions: createActions(tiles),
    reducer: createReducers(tiles, topReducer),
    selectors: createSelectors(tiles)
  };
}