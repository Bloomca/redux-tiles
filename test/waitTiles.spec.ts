import { waitTiles, createTile, createActions, createReducers, createMiddleware } from '../src';
import { createStore, applyMiddleware } from 'redux';
import { sleep } from 'delounce';

test('waitTiles should wait until all promises will be resolved in storage',  async () => {
  const firstTile = createTile({
    type: ['some', 'another'],
    fn: async () => {
      await sleep(100);
      return { success: true };
    },
  });

  const secondTile = createTile({
    type: ['second', 'tile'],
    fn: async () => {
      await sleep(50);
      return { data: 'some' };
    },
  });

  const tiles = [firstTile, secondTile];

  const { actions, promisesStorage } = createActions(tiles);
  const reducer = createReducers(tiles);

  const store = createStore(reducer, {}, applyMiddleware(createMiddleware()));
  store.dispatch(actions.some.another());
  store.dispatch(actions.second.tile());

  await waitTiles(promisesStorage);

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