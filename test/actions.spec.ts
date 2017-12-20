import { spy, stub } from "sinon";
import { createTile, createSyncTile } from "../src/tiles";
import { asyncAction, syncAction } from "../src/tiles/actions";

test("should create an action", () => {
  const tile = createTile({
    type: "Some"
  });

  expect(tile.action).toBeInstanceOf(Function);
});

test("action should detect thunk middleware", () => {
  const fn = stub().returns(Promise.resolve());
  const tile = createTile({
    type: "Some",
    fn
  });

  const dispatch = () => {};
  const getState = () => {};
  const params = {};
  tile.action(params)(dispatch, getState);
  expect(fn.calledWith({ dispatch, getState, params })).toBe(true);
});

test("action should detect thunk middleware with additional params", () => {
  const fn = stub().returns(Promise.resolve());
  const tile = createTile({
    type: "Some",
    fn
  });

  const dispatch = () => {};
  const getState = () => {};
  const params = {};
  const additionalParams = { some: true };
  tile.action(params)(dispatch, getState, additionalParams);
  expect(fn.calledWith({ dispatch, getState, params, some: true })).toBe(true);
});

test("action should detect our middleware", () => {
  const fn = stub().returns(Promise.resolve());
  const tile = createTile({
    type: "Some",
    fn
  });

  const dispatch = () => {};
  const getState = () => {};
  const actions = { some: () => {} };
  const params = {};
  tile.action(params)({ dispatch, getState, actions });
  expect(fn.calledWith({ dispatch, getState, params, actions })).toBe(true);
});

test("asyncAction should invoke dispatch correct number of times", async () => {
  const fn = stub();
  fn.returns(new Promise(res => res({ data: true })));
  const START = "START";
  const SUCCESS = "SUCCESS";
  const action = asyncAction({
    type: ["some"],
    START,
    SUCCESS,
    fn
  });

  const dispatch = spy();
  const getState = spy();

  await action({ id: 1234 })({ dispatch, getState });

  expect(dispatch.calledTwice).toBe(true);
  expect(dispatch.calledTwice).toBe(true);
});

test("asyncAction should invoke dispatch with correct types", async () => {
  const fn = stub();
  fn.returns(new Promise(res => res({ data: true })));
  const START = "START";
  const SUCCESS = "SUCCESS";
  const action = asyncAction({
    type: ["some"],
    START,
    SUCCESS,
    fn
  });

  const dispatch = spy();
  const getState = spy();

  await action({ id: 1234 })({ dispatch, getState });

  const firstDispatch = dispatch.getCall(0);
  const secondDispatch = dispatch.getCall(1);

  expect(firstDispatch.args[0].type).toBe(START);
  expect(secondDispatch.args[0].type).toBe(SUCCESS);
});

test("asyncAction should invoke dispatch with error", async () => {
  const fn = stub();
  fn.returns(new Promise((res, reject) => reject({ error: "some" })));
  const START = "START";
  const FAILURE = "FAILURE";
  const SUCCESS = "SUCCESS";
  const action = asyncAction({
    type: ["some"],
    START,
    FAILURE,
    SUCCESS,
    fn
  });

  const dispatch = spy();
  const getState = spy();

  await action({ id: 1234 })({ dispatch, getState });

  const secondDispatch = dispatch.getCall(1);
  expect(secondDispatch.args[0].type).toBe(FAILURE);
});

test("asyncAction should't invoke dispatch if is loading with caching", async () => {
  const START = "START";
  const FAILURE = "FAILURE";
  const SUCCESS = "SUCCESS";
  const action = asyncAction({
    type: "some",
    START,
    FAILURE,
    SUCCESS,
    selectors: {
      get: () => ({ isPending: true, error: null, fetched: false })
    },
    fn: () => Promise.resolve(13),
    caching: true
  });

  const dispatch = spy();
  const getState = spy();

  await action({ id: 1234 })({ dispatch, getState });

  expect(dispatch.notCalled).toBe(true);
});

test("asyncAction should't invoke dispatch if loaded with caching", async () => {
  const START = "START";
  const FAILURE = "FAILURE";
  const SUCCESS = "SUCCESS";
  const action = asyncAction({
    type: ["some"],
    START,
    FAILURE,
    SUCCESS,
    selectors: {
      get: () => ({ isPending: false, data: { a: "b" } })
    },
    caching: true
  });

  const dispatch = spy();
  const getState = spy();

  await action({ id: 1234 })({ dispatch, getState });

  expect(dispatch.notCalled).toBe(true);
});

test("asyncAction should invoke dispatch if loaded with caching, but with force", async () => {
  const START = "START";
  const FAILURE = "FAILURE";
  const SUCCESS = "SUCCESS";
  const action = asyncAction({
    type: ["some"],
    START,
    FAILURE,
    SUCCESS,
    selectors: {
      get: () => ({ isLoading: false, data: { a: "b" } })
    },
    fn: () => Promise.resolve(),
    caching: true
  });

  const dispatch = spy();
  const getState = spy();

  await action({ id: 1234 }, { forceAsync: true })({ dispatch, getState });

  expect(dispatch.callCount).toBe(2);
});

test("syncAction should dispatch processedData immediately", () => {
  const TYPE = "TYPE";
  const params = { some: true };
  const action = syncAction({
    type: ["type"],
    TYPE,
    fn: () => params
  });

  const dispatch = spy();
  const getState = () => {};
  const selectors = {
    type: () => {}
  };

  action(params)({ dispatch, getState, selectors });

  const call = dispatch.getCall(0);
  expect(call.args[0].payload.data).toEqual(params);
});

test("async Action should invoke action with different params", async () => {
  const action = stub();
  action.returns(new Promise(res => setTimeout(() => res({ some: true }), 10)));
  const tile = createTile({
    type: ["some", "nested", "type"],
    fn: action,
    nesting: ({ id }) => [id]
  });

  const promisesStorage = {};
  const middlewares = { promisesStorage, dispatch: () => {} };

  const promise1 = tile.action({ id: 1 })(middlewares);
  const promise2 = tile.action({ id: 2 })(middlewares);

  await Promise.all([promise1, promise2]);

  expect(action.calledTwice).toBe(true);
});

test("createSyncTile should attach all functions from fns to action", () => {
  const tile = createSyncTile({
    type: ["some"],
    fns: {
      add: () => {}
    }
  });

  expect(tile.action.add).toBeInstanceOf(Function);
});

test("createSyncTile should execute functions from fns correctly", () => {
  const tile = createSyncTile({
    type: ["some"],
    fns: {
      add: ({ params }) => params
    }
  });

  const dispatch = spy();
  const selectors = {
    some: () => {}
  };
  const middlewares = { dispatch, selectors };
  const params = { some: 123 };
  tile.action.add(params)(middlewares);

  const arg = dispatch.getCall(0).args[0];

  expect(arg.payload.data).toBe(params);
});

test("createSyncTile should get currentData", () => {
  const tile = createSyncTile({
    type: ["some"],
    fn: spy()
  });

  const dispatch = () => {};
  const getState = () => ({ some: true });
  const middlewares = { dispatch, getState };
  const params = { some: 123 };
  tile.action(params)(middlewares);

  const arg = tile.reflect.fn.getCall(0).args[0];
  const data = arg.getData();

  expect(data).toBe(true);
});

test("getData fn in createSyncTile should handle nested types", () => {
  const tile = createSyncTile({
    type: ["some", "additional"],
    fn: spy()
  });

  const dispatch = () => {};
  const getState = () => ({
    some: {
      additional: "some string"
    }
  });

  const middlewares = { dispatch, getState };
  const params = { some: 123 };
  tile.action(params)(middlewares);

  const arg = tile.reflect.fn.getCall(0).args[0];
  const data = arg.getData();

  expect(data).toBe("some string");
});
