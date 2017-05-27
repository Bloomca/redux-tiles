import { createReducers, createNestedReducers } from '../src/createReducers';
import { createTile } from '../src';

test('createNestedResources should create correct function', () => {
  const firstModule = createTile({
    type: 'some',
    fn: () => Promise.resolve('some'),
  });

  const reducer = createNestedReducers({
    some: firstModule.reducer
  });

  expect(reducer).toBeInstanceOf(Function);
});

test('createNestedResources should create correct function with nested type', () => {
  const firstModule = createTile({
    type: ['some', 'value'],
    fn: () => Promise.resolve('some'),
  });

  const reducer = createNestedReducers({
    some: firstModule.reducer
  });

  expect(reducer).toBeInstanceOf(Function);
});


test('createReducers should create no nesting by default', () => {
  const firstModule = createTile({
    type: 'some',
    fn: () => Promise.resolve('some'),
  });

  const secondModule = createTile({
    type: 'another',
    fn: () => Promise.resolve('more info'),
  });

  const reducer = createReducers([
    firstModule, secondModule
  ]);

  const newState = reducer({}, {
    type: firstModule.constants.START,
    payload: {}
  });

  expect(newState).toEqual({
    some: { data: null, isPending: true, error: null },
    another: { data: null, isPending: false, error: null }
  })
});

test('createReducers should create correct nesting', () => {
  const firstModule = createTile({
    type: ['some', 'nesting'],
    fn: () => Promise.resolve('some'),
  });

  const secondModule = createTile({
    type: ['another', 'nesting'],
    fn: () => Promise.resolve('more info'),
  });

  const reducer = createReducers([
    firstModule, secondModule
  ]);

  const newState = reducer({}, {
    type: firstModule.constants.START,
    payload: {}
  });

  expect(newState).toEqual({
    some: {
      nesting: { data: null, isPending: true, error: null }
    },
    another: {
      nesting: { data: null, isPending: false, error: null }
    }
  })
});