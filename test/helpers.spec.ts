import { populateHash } from '../src/helpers';

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