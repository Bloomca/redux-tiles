import { createTile, createSyncTile, createEntities, createMiddleware } from '../src';
import { createStore, applyMiddleware } from 'redux';
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

  expect(data).toEqual({ data: null, error: null, isPending: false });
});

test('createTile should return overriden value if not in the state', () => {
  const params = {
    type: ['some', 'user'],
    fn: () => 'some message!',
    selectorFallback: { myProperty: true }
  };
  const tile = createTile(params);

  const data = tile.selectors.get({});

  expect(data).toEqual({ isPending: false, error: null, data: { myProperty: true } });
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
  expect(newState).toEqual({ isPending: false, error, data: null });
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
  syncTile.action(params)({ dispatch });

  const call = dispatch.getCall(0);
  const arg = call.args[0];

  const resultAction = {
    type: syncTile.constants.SET,
    payload: {
      path: null,
      data: params
    }
  };
  expect(arg).toEqual(resultAction);
});

test('createSyncTile should update values after dispatching action correctly', () => {
  const someTile = createSyncTile({ type: 'some' });
  const tiles = [someTile];
  const { reducer, actions, selectors } = createEntities(tiles);
  const { middleware } = createMiddleware();
  const store = createStore(reducer, applyMiddleware(middleware));
  store.dispatch(actions.some('some'));
  const result = selectors.some(store.getState());
  expect(result).toBe('some');
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
  expect(result).toEqual({ isPending: false, error: null, data: { some: true } });
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
  expect(result).toEqual({ isPending: false, data: null, error: { some: true } });
});