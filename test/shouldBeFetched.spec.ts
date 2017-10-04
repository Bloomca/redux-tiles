import { shouldBeFetched } from '../src/tiles/actions';

test('shouldBeFetched should fetch if was not fetched', () => {
  const params = {
    isPending: false,
    fetched: false,
    error: null,
  };
  const result = shouldBeFetched(params);
  expect(result).toBe(true);
});

test('shouldBeFetched should fetch if was fetched with an error', () => {
  const params = {
    isPending: false,
    fetched: true,
    error: new Error('some'),
  };
  const result = shouldBeFetched(params);
  expect(result).toBe(true);
});

test('shouldBeFetched should not fetch if no error and was fetched', () => {
  const params = {
    isPending: false,
    fetched: true,
    error: null,
  };
  const result = shouldBeFetched(params);
  expect(result).toBe(false);
});

test('shouldBeFetched should not fetch if in process', () => {
  const params = {
    isPending: true,
    fetched: false,
    error: null,
  };
  const result = shouldBeFetched(params);
  expect(result).toBe(false);
});
