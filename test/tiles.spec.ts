import { createTile, createSyncTile } from '../src';

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