import { createMiddleware } from '../src';
import { spy } from 'sinon';

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