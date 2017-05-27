import { createTile } from '../src/modules';
import { stub } from 'sinon';

test('should create an action', () => {
  const tile = createTile({
    type: 'Some'
  });

  expect(tile.action).toBeInstanceOf(Function);
});

test('action should detect thunk middleware', () => {
  const fn = stub().returns(Promise.resolve());
  const tile = createTile({
    type: 'Some',
    fn
  });

  const dispatch = () => {};
  const getState = () => {};
  const params = {};
  tile.action({})(params)(dispatch, getState);
  expect(fn.calledWith({ dispatch, getState, params })).toBe(true);
});

test('action should detect our middleware', () => {
  const fn = stub().returns(Promise.resolve());
  const tile = createTile({
    type: 'Some',
    fn
  });

  const dispatch = () => {};
  const getState = () => {};
  const actions = { some: () => {} };
  const params = {};
  tile.action({})(params)({ dispatch, getState, actions });
  expect(fn.calledWith({ dispatch, getState, params, actions })).toBe(true);
});