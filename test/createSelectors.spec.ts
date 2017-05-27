import { createSelectors, createTile } from '../src';

test('createSelectors should get data from our own namespace', () => {
  const module = createTile({
    type: ['user', 'auth'],
    fn: () => Promise.resolve('some'),
  });
  
  const selectors = createSelectors([
    module
  ], 'myTiles');

  const state = { myTiles: { user: { auth: { myData: 123 } }} };
  expect(selectors.user.auth(state)).toEqual({ myData: 123 });
});

test('createSelectors should get data from default namespace', () => {
  const module = createTile({
    type: 'userAuth',
    fn: () => Promise.resolve('some'),
  });
  
  const selectors = createSelectors([
    module
  ]);

  const state = { redux_tiles: { userAuth: { myData: 123 } }};
  expect(selectors.userAuth(state)).toEqual({ myData: 123 });
});