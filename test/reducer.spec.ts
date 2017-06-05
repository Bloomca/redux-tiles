import * as tileReducer from '../src/modules/reducer';

test('createReducer should not touch state if it is not for it\'s action', () => {
  const action = 'SOME_ACTION';
  const reducer = tileReducer.createReducer([], {});

  const state = { some: { nested: true } };
  const result = reducer(state, { type: action });
  expect(result).toEqual(state);
});

test('createReducer should return function which reacts to correct action types', () => {
  const action = 'SOME_ACTION';
  const reducer = tileReducer.createReducer([], {
    [action]: () => ({ success: true })
  });

  const result = reducer(null, { type: action, payload: {} });
  expect(result).toEqual({ success: true });
});

test('reducerCreator should update correct entity with arity one', () => {
  const newValue = { new: true };
  const action = {
    payload: {
      path: ['some']
    }
  };
  const state = { some: { old: true } };
  const newState = tileReducer.reducerCreator({ newValue, state, action });

  expect(newState).toEqual({ some: newValue });
});

test('reducerCreator should update correct entity with arity two', () => {
  const newValue = { new: true };
  const action = {
    payload: {
      path: ['first', 'second']
    }
  };
  const state = { first: { second: { old: true } } };
  const newState = tileReducer.reducerCreator({ newValue, state, action });

  expect(newState).toEqual({ first: { second: newValue } });
});

test('reducerCreator should update correct entity with nested arity three', () => {
  const newValue = { some: true };
  const action = {
    payload: {
      path: 'first.second.third'.split('.')
    }
  };
  const state = { first: { second: { third: { some: false } } } };
  const newState = tileReducer.reducerCreator({ newValue, state, action });

  expect(newState).toEqual({ first: { second: { third: newValue } } });
});
