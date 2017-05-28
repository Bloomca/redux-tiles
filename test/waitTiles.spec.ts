import { createTile, createActions, createReducers, createMiddleware } from '../src';
import { createStore, applyMiddleware } from 'redux';
import { sleep } from 'delounce';
import { get } from 'lodash';

function imitateStore({ firstType, firstDelay, secondType, secondDelay }) {
  const firstTile = createTile({
    type: firstType,
    fn: async () => {
      await sleep(firstDelay);
      return { success: true };
    },
  });

  const secondTile = createTile({
    type: secondType,
    fn: async () => {
      await sleep(secondDelay);
      return { data: 'some' };
    },
  });

  const tiles = [firstTile, secondTile];

  const actions = createActions(tiles);
  const reducer = createReducers(tiles);

  const { middleware, waitTiles } = createMiddleware();
  const store = createStore(reducer, {}, applyMiddleware(middleware));
  store.dispatch(get(actions, firstType)());
  store.dispatch(get(actions, secondType)());

  return { store, waitTiles };
}

test('waitTiles should wait until all promises will be resolved in storage',  async () => {
  const { store, waitTiles } = imitateStore({
    firstType: ['some', 'another'],
    firstDelay: 50,
    secondType: ['second', 'tile'],
    secondDelay: 100
  });

  await waitTiles();

  expect(store.getState()).toEqual({
    some: {
      another: {
        data: { success: true },
        isPending: false,
        error: null,
      },
    },
    second: {
      tile: {
        data: { data: 'some' },
        isPending: false,
        error: null,
      },
    },
  });
});

test('waitTiles should wait until all promises will be resolved in storage',  async () => {
  imitateStore({
    firstType: ['first', 'another'],
    firstDelay: 50,
    secondType: ['second', 'tile'],
    secondDelay: 100
  });

  const { store, waitTiles } = imitateStore({
    firstType: ['new_store', 'another'],
    firstDelay: 20,
    secondType: ['second_tile', 'tile'],
    secondDelay: 40
  });

  await waitTiles();

  expect(store.getState()).toEqual({
    new_store: {
      another: {
        data: { success: true },
        isPending: false,
        error: null,
      },
    },
    second_tile: {
      tile: {
        data: { data: 'some' },
        isPending: false,
        error: null,
      },
    },
  });
});