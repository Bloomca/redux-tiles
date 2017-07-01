import { shouldBeFetched } from '../src/tiles/actions';

test('shouldBeFetched should fetch if was not fetched', () => {
  const getState = () => {};
  const selectors = {
    get: () => ({
      isPending: false,
      fetched: false,
      error: null,
    }),
  };
  const result = shouldBeFetched({ selectors, getState });
  expect(result).toBe(true);
});

test('shouldBeFetched should fetch if was fetched with an error', () => {
  const getState = () => {};
  const selectors = {
    get: () => ({
      isPending: false,
      fetched: true,
      error: new Error('some'),
    }),
  };
  const result = shouldBeFetched({ selectors, getState });
  expect(result).toBe(true);
});

test('shouldBeFetched should not fetch if no error and was fetched', () => {
  const getState = () => {};
  const selectors = {
    get: () => ({
      isPending: false,
      fetched: true,
      error: null,
    }),
  };
  const result = shouldBeFetched({ selectors, getState });
  expect(result).toBe(false);
});

test('shouldBeFetched should not fetch if in process', () => {
  const getState = () => {};
  const selectors = {
    get: () => ({
      isPending: true,
      fetched: false,
      error: null,
    }),
  };
  const result = shouldBeFetched({ selectors, getState });
  expect(result).toBe(false);
});
