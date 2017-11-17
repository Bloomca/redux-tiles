import { createTile, createSyncTile, createEntities, createMiddleware } from '../src';
import { createStore, applyMiddleware } from 'redux';
import { sleep } from 'delounce';
import { spy } from 'sinon';

test('createTile should be able to reflect all passed info', () => {
  const params = {
    type: ['some', 'user'],
    fn: () => Promise.reject('some error!')
  };
  const tile = createTile(params);

  expect(params).toBe(tile.reflect);
});

test('createSyncTile should be able to reflect all passed info', () => {
  const params = {
    type: ['some', 'user'],
    fn: () => 'some message!'
  };
  const syncTile = createSyncTile(params);

  expect(params).toBe(syncTile.reflect);
});

test('createTile should return default value if not in the state', () => {
  const params = {
    type: ['some', 'user'],
    fn: () => 'some message!'
  };
  const syncTile = createTile(params);

  const data = syncTile.selectors.get({});

  expect(data).toEqual({ data: null, error: null, isPending: false, fetched: false });
});

test('createTile should return overriden value if not in the state', () => {
  const params = {
    type: ['some', 'user'],
    fn: () => 'some message!',
    selectorFallback: { myProperty: true }
  };
  const tile = createTile(params);

  const data = tile.selectors.get({});

  expect(data).toEqual({ isPending: false, error: null, data: { myProperty: true }, fetched: false });
});

test('createTile should create new state if error', () => {
  const someTile = createTile({
    type: ['some'],
    fn: () => Promise.reject({ some: 'error' })
  });

  const error = new Error('some');
  const action = {
    type: someTile.constants.FAILURE,
    payload: { path: null },
    error: new Error('some')
  };
  const newState: {} = someTile.reducer({}, action);
  expect(newState).toEqual({ isPending: false, error, data: null, fetched: true, });
});

test('createSyncTile should return overriden value if not in the state', () => {
  const params = {
    type: ['some', 'user'],
    fn: () => 'some message!',
    selectorFallback: { myProperty: true }
  };
  const syncTile = createSyncTile(params);

  const data = syncTile.selectors.get({});

  expect(data).toEqual({ myProperty: true });
});

test('createSyncTile should return params if no function was given', () => {
  const syncTile = createSyncTile({ type: 'some' });

  const params = { some: 123 };
  const dispatch = spy();
  const selectors = {
    some: () => {}
  }
  syncTile.action(params)({ dispatch, selectors });

  const call = dispatch.getCall(0);
  const arg = call.args[0];

  const resultAction = {
    type: syncTile.constants.SET,
    payload: {
      path: null,
      data: params
    },
    data: params
  };
  expect(arg).toEqual(resultAction);
});

test('createSyncTile should update values after dispatching action correctly', () => {
  const someTile = createSyncTile({ type: 'some' });
  const tiles = [someTile];
  const { reducer, actions, selectors } = createEntities(tiles);
  const { middleware } = createMiddleware({ actions, selectors });
  const store = createStore(reducer, applyMiddleware(middleware));
  const { data: result } = store.dispatch(actions.some('some'));
  expect(result).toBe('some');
});

test('createTile should have correct default initial state', async () => {
  const someTile = createTile({
    type: 'some',
    fn: () => Promise.resolve({ some: true }),
  });
  const tiles = [someTile];
  const { reducer, actions, selectors } = createEntities(tiles);
  const { middleware } = createMiddleware();
  const store = createStore(reducer, applyMiddleware(middleware));
  const result = selectors.some(store.getState());
  expect(result).toEqual({ isPending: false, error: null, data: null, fetched: false });
});

test('createTile should update values after dispatching action correctly', async () => {
  const someTile = createTile({
    type: 'some',
    fn: () => Promise.resolve({ some: true }),
  });
  const tiles = [someTile];
  const { reducer, actions, selectors } = createEntities(tiles);
  const { middleware } = createMiddleware();
  const store = createStore(reducer, applyMiddleware(middleware));
  await store.dispatch(actions.some('some'));
  const result = selectors.some(store.getState());
  expect(result).toEqual({ isPending: false, error: null, data: { some: true }, fetched: true });
});

test('createTile should receive data property after dispatching action correctly', async () => {
  const someTile = createTile({
    type: 'some',
    fn: () => Promise.resolve({ some: true }),
  });
  const tiles = [someTile];
  const { reducer, actions, selectors } = createEntities(tiles);
  const { middleware } = createMiddleware();
  const store = createStore(reducer, applyMiddleware(middleware));
  const { data: result } = await store.dispatch(actions.some('some'));
  expect(result).toEqual({ some: true });
});

test('createTile should receive data property after dispatching action correctly with cached version', async () => {
  const someTile = createTile({
    type: 'some',
    fn: () => Promise.resolve({ some: true }),
    caching: true
  });
  const tiles = [someTile];
  const { reducer, actions, selectors } = createEntities(tiles);
  const { middleware } = createMiddleware();
  const store = createStore(reducer, applyMiddleware(middleware));
  await store.dispatch(actions.some('some'));
  const { data: result } = await store.dispatch(actions.some('some'));
  expect(result).toEqual({ some: true });
});

test('createTile should update values after dispatching action with rejection correctly', async () => {
  const someTile = createTile({
    type: 'some',
    fn: () => Promise.reject({ some: true }),
  });
  const tiles = [someTile];
  const { reducer, actions, selectors } = createEntities(tiles);
  const { middleware } = createMiddleware();
  const store = createStore(reducer, applyMiddleware(middleware));
  await store.dispatch(actions.some('some'));
  const result = selectors.some(store.getState());
  expect(result).toEqual({ isPending: false, data: null, error: { some: true }, fetched: true });
});

test('createTile should receive error property after dispatching action with rejection correctly', async () => {
  const someTile = createTile({
    type: 'some',
    fn: () => Promise.reject({ some: true }),
  });
  const tiles = [someTile];
  const { reducer, actions, selectors } = createEntities(tiles);
  const { middleware } = createMiddleware();
  const store = createStore(reducer, applyMiddleware(middleware));
  const { error: result } = await store.dispatch(actions.some('some'));
  expect(result).toEqual({ some: true });
});

test('createTile should keep only one active request if caching', async () => {
  const someTile = createTile({
    type: 'some',
    caching: true,
    fn: async () => {
      await sleep(10);

      return { some: true };
    }
  });
  const tiles = [someTile];
  const { reducer, actions, selectors } = createEntities(tiles);
  const { middleware } = createMiddleware();
  const store = createStore(reducer, applyMiddleware(middleware));
  const promise1 = store.dispatch(actions.some('some'));
  const promise2 = store.dispatch(actions.some('some'));
  expect(promise1).toBe(promise2);
});

test('createTile should keep different requests if caching', async () => {
  const someTile = createTile({
    type: 'some',
    caching: true,
    fn: async () => {
      await sleep(10);

      return { some: true };
    }
  });
  const tiles = [someTile];
  const { reducer, actions, selectors } = createEntities(tiles);
  const { middleware } = createMiddleware();
  const store = createStore(reducer, applyMiddleware(middleware));
  const promise1 = store.dispatch(actions.some('some'));
  const promise2 = store.dispatch(actions.some('some'));
  expect(promise1).toBe(promise2);
});
