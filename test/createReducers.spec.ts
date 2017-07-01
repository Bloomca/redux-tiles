import { createReducers, createNestedReducers } from '../src/createReducers';
import { createTile, createSyncTile } from '../src';

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
    some: { data: null, isPending: true, error: null, fetched: false },
    another: null,
  });
});

test('createReducers should create correct default values with different initial state', () => {
  const firstModule = createSyncTile({
    type: 'some',
    fn: () => 'some',
    initialState: { some: 123 }
  });

  const secondModule = createSyncTile({
    type: 'another',
    fn: () => 'more info',
    initialState: { another: false }
  });

  const reducer = createReducers([
    firstModule, secondModule
  ]);

  const newState = reducer({}, {
    type: 'SOME RANDOM CONSTANT',
    payload: {}
  });

  expect(newState).toEqual({
    some: { some: 123 },
    another: { another: false }
  });
});

test('createReducers should reset to initial state correctly after reset', () => {
  const firstModule = createSyncTile({
    type: 'some',
    fn: () => 'some',
    initialState: { some: 123 }
  });

  const reducer = createReducers([
    firstModule
  ]);

  const firstState = reducer({}, {
    type: firstModule.constants.SET,
    payload: { data: 'some new info' }
  });

  const newState = reducer(firstState, {
    type: firstModule.constants.RESET,
    payload: {}
  });

  expect(newState).toEqual({
    some: { some: 123 },
  });
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

  const thirdModule = createTile({
    type: ['another', 'withNesting'],
    fn: () => Promise.resolve('more info'),
    nesting: ({ id }) => [id],
  });

  const reducer = createReducers([
    firstModule, secondModule, thirdModule
  ]);

  const newState = reducer({}, {
    type: firstModule.constants.START,
    payload: {}
  });

  expect(newState).toEqual({
    some: {
      nesting: { data: null, isPending: true, error: null, fetched: false }
    },
    another: {
      nesting: null,
      withNesting: {}
    }
  });
});