import { createTile } from '../src/modules';
import { asyncAction, syncAction } from '../src/modules/actions';
import { stub, spy } from 'sinon';

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
  tile.action(params)(dispatch, getState);
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
  tile.action(params)({ dispatch, getState, actions });
  expect(fn.calledWith({ dispatch, getState, params, actions })).toBe(true);
});


test('asyncAction should invoke dispatch correct number of times', async () => {
  const fn = stub();
  fn.returns(new Promise(res => res({ data: true })));
  const START = 'START';
  const SUCCESS = 'SUCCESS';
  const action = asyncAction({
    type: ['some'],
    START, SUCCESS,
    fn
  });

  const dispatch = spy();
  const getState = spy();

  await action({ id: 1234 })({ dispatch, getState });

  expect(dispatch.calledTwice).toBe(true);
  expect(dispatch.calledTwice).toBe(true);
});

test('asyncAction should invoke dispatch with correct types', async () => {
  const fn = stub();
  fn.returns(new Promise(res => res({ data: true })));
  const START = 'START';
  const SUCCESS = 'SUCCESS';
  const action = asyncAction({
    type: ['some'],
    START, SUCCESS,
    fn,
  });

  const dispatch = spy();
  const getState = spy();

  await action({ id: 1234 })({ dispatch, getState });

  const firstDispatch = dispatch.getCall(0);
  const secondDispatch = dispatch.getCall(1);

  expect(firstDispatch.args[0].type).toBe(START);
  expect(secondDispatch.args[0].type).toBe(SUCCESS);
});

test('asyncAction should invoke dispatch with error', async () => {
  const fn = stub();
  fn.returns(new Promise((res, reject) => reject({ error: 'some' })));
  const START = 'START';
  const FAILURE = 'FAILURE';
  const SUCCESS = 'SUCCESS';
  const action = asyncAction({
    type: ['some'],
    START, FAILURE, SUCCESS,
    fn
  });

  const dispatch = spy();
  const getState = spy();

  await action({ id: 1234 })({ dispatch, getState });

  const secondDispatch = dispatch.getCall(1);
  expect(secondDispatch.args[0].type).toBe(FAILURE);
});

test('asyncAction should\'t invoke dispatch if is loading with caching', async () => {
  const START = 'START';
  const FAILURE = 'FAILURE';
  const SUCCESS = 'SUCCESS';
  const action = asyncAction({
    type: 'some',
    START, FAILURE, SUCCESS,
    selectors: {
      get: () => ({ isPending: true }),
    },
    fn: () => Promise.resolve(13),
    caching: true
  });

  const dispatch = spy();
  const getState = spy();

  await action({ id: 1234 })({ dispatch, getState });

  expect(dispatch.notCalled).toBe(true);
});

test('asyncAction should\'t invoke dispatch if loaded with caching', async () => {
  const START = 'START';
  const FAILURE = 'FAILURE';
  const SUCCESS = 'SUCCESS';
  const action = asyncAction({
    type: ['some'],
    START, FAILURE, SUCCESS,
    selectors: {
      get: () => ({ isPending: false, data: { a: 'b' } })
    },
    caching: true
  });

  const dispatch = spy();
  const getState = spy();

  await action({ id: 1234 })({ dispatch, getState });

  expect(dispatch.notCalled).toBe(true);
});

test('asyncAction should invoke dispatch if loaded with caching, but with force', async () => {
  const START = 'START';
  const FAILURE = 'FAILURE';
  const SUCCESS = 'SUCCESS';
  const action = asyncAction({
    type: ['some'],
    START, FAILURE, SUCCESS,
    selectors: {
      get: () => ({ isLoading: false, data: { a: 'b' } }),
    },
    fn: () => Promise.resolve(),
    caching: true
  });

  const dispatch = spy();
  const getState = spy();

  await action({ id: 1234 }, { forceAsync: true })({ dispatch, getState });

  expect(dispatch.callCount).toBe(2);
});

test('syncAction should dispatch processedData immediately', () => {
  const TYPE = 'TYPE';
  const params = { some: true };
  const action = syncAction({
    type: ['type'],
    TYPE,
    fn: () => params
  });

  const dispatch = spy();
  const getState = () => {};

  action(params)({ dispatch, getState });

  const call = dispatch.getCall(0);
  expect(call.args[0].payload.data).toEqual(params);
});