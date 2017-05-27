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