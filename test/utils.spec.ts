import { get, isArray, mapValues } from '../src/utils';

test('isArray should detect normal Array literal correctly', () => {
  const array = [1, 2, 3];
  expect(isArray(array)).toBe(true);
});

test('isArray should consider object as non-array', () => {
  const array = { some: true };
  expect(isArray(array)).toBe(false);
});

test('isArray should consider string as non-array', () => {
  const array = 'some string';
  expect(isArray(array)).toBe(false);
});

test('get should go arbitrary number of levels deep', () => {
  const object = {
    some: {
      nested: {
        path: 'string'
      }
    }
  };
  const path = ['some', 'nested', 'path'];
  const result = get(object, path);

  expect(result).toBe('string');
});

test('get should return undefined in case there is no this way', () => {
  const object = {
    some: {
      nested: {
        path: 'string'
      }
    }
  };
  const path = ['some', 'wrong', 'path'];
  const result = get(object, path);

  expect(result).toBe(undefined);
});

test('mapValues should return the same object, but with applied callback to all values', () => {
  const object = {
    a: 1,
    b: 2,
  };
  const cb = x => x * 2;
  const result = mapValues(object, cb);
  expect(result).toEqual({
    a: 2,
    b: 4
  });
});
