import { createEntities, createMiddleware } from 'redux-tiles';
import { createStore, applyMiddleware } from 'redux';
import tiles from './tiles/todos';

export const { actions, reducer, selectors } = createEntities(tiles);
const { middleware } = createMiddleware({ actions, selectors });

export default createStore(reducer, applyMiddleware(middleware));
