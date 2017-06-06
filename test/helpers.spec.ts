import { iterate, populateHash } from '../src/helpers';

test('iterate should correctly transform object to array', () => {
  const tiles = {
    tile1: 'first',
    tile2: 'second'
  };
  const processedArray = iterate(tiles);
  expect(processedArray.includes('first')).toBe(true);
  expect(processedArray.includes('second')).toBe(true);
});

test('populateHash should create nested path', () => {
  const obj = {};
  populateHash(obj, ['some', 'way', 'deep'], 2);

  expect(obj).toEqual({ some: { way: { deep: 2 }}});
});

test('populateHash should add new properties to existing path', () => {
  const obj = { some: { way: { one: 1 }}};
  populateHash(obj, ['some', 'way', 'deep'], 2);

  expect(obj).toEqual({ some: { way: { one: 1, deep: 2 }}});
});