import { createSelectors, createTile } from '../src';
import { changeDefaultReducer } from '../src/tiles/selectors';

test('createSelectors should get data without namespace', () => {
  const module = createTile({
    type: 'userAuth',
    fn: () => Promise.resolve('some'),
  });
  
  const selectors = createSelectors([
    module
  ]);

  const state = { userAuth: { myData: 123 } };
  expect(selectors.userAuth(state)).toEqual({ myData: 123 });
});

test('createSelectors should get data from our own namespace', () => {
  const module = createTile({
    type: ['user', 'auth'],
    fn: () => Promise.resolve('some'),
  });
  
  changeDefaultReducer('myTiles');
  const selectors = createSelectors([
    module
  ]);

  const state = { myTiles: { user: { auth: { myData: 123 } }} };
  expect(selectors.user.auth(state)).toEqual({ myData: 123 });
});