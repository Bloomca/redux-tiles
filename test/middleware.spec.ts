import { createMiddleware } from '../src';
import { spy } from 'sinon';

test('createMiddleware should call action if it is a function', () => {
  const params = { some: 123 };
  const { middleware } = createMiddleware({ params });
  const dispatch = () => {};
  const getState = () => {};
  const action: any = spy();
  middleware({ dispatch, getState })(() => {})(action);

  expect(action.calledOnce).toBe(true);
});

test('createMiddleware should not call next if action is a function', () => {
  const params = { some: 123 };
  const { middleware } = createMiddleware({ params });
  const dispatch = () => {};
  const getState = () => {};
  const action = () => {};
  const next: any = spy();
  middleware({ dispatch, getState })(next)(action);

  expect(next.notCalled).toBe(true);
});

test('createMiddleware should call next if action is not a function', () => {
  const params = { some: 123 };
  const { middleware } = createMiddleware({ params });
  const dispatch = () => {};
  const getState = () => {};
  const action = { some: true };
  const next: any = spy();
  middleware({ dispatch, getState })(next)(action);

  expect(next.calledOnce).toBe(true);
});

test('createMiddleware should pass injected params to dispatched actions', () => {
  const params = { some: 123 };
  const { middleware } = createMiddleware({ params });
  const dispatch = () => {};
  const getState = () => {};
  const action: any = spy();
  middleware({ dispatch, getState })(() => {})(action);

  expect(action.calledWith({ dispatch, getState, params, promisesStorage: {} })).toBe(true);
});

test('createMiddleware should invoke next if not a function', () => {
  const params = { some: 123 };
  const { middleware } = createMiddleware({ params });
  const dispatch = () => {};
  const getState = () => {};
  const next = spy();
  middleware({ dispatch, getState })(next)({ type: 'FAKE' });

  expect(next.calledWith({ type: 'FAKE' })).toBe(true);
});