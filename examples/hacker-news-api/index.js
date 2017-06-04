import { createEntities, createMiddleware } from 'redux-tiles';
import { createStore, applyMiddleware } from 'redux';
import api from './api';
import tiles from './hn-tiles';

const { actions, reducer, selectors } = createEntities(tiles);
const { middleware, waitTiles } = createMiddleware({ api, actions, selectors });

const store = createStore(
  reducer,
  applyMiddleware(middleware)
);

export default { store, waitTiles, actions, selectors };
