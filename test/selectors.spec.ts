import { createSelectors, DEFAULT_REDUCER } from '../src/tiles/selectors';

test('createSelectors should return selectorFallback value for async Tile', () => {
  const { get } = createSelectors({
    tileName: 'myTile',
    nesting: () => ['some', 'another'],
    selectorFallback: { some: '123' }
  });

  const result = get(
    {}
  );
  expect(result).toEqual({ some: '123' });
});

test('createSelectors should select with nesting', () => {
  const { get } = createSelectors({
    tileName: 'myTile',
    nesting: () => ['some', 'another']
  });

  const result = get(
    { myTile: { some: { another: 23 } } }
  );
  expect(result).toBe(23);
});

test('createSelectors should correctly select with combining reducers', () => {
  const { get } = createSelectors({
    tileName: ['myTile', 'nested'],
    nesting: () => ['some', 'another']
  });

  const result = get(
    { myTile: { nested: { some: { another: 23 } } } }
  );
  expect(result).toBe(23);
});

test('createSelectors should select correctly with params as a function', () => {
  const { get } = createSelectors({
    tileName: ['myTile', 'nested'],
    nesting: ({ id, type }) => [id, type],
  });

  const result = get(
    { myTile: { nested: { one: { two: 125 } } }},
    { id: 'one', type: 'two' }
  );

  expect(result).toBe(125);
});

test('createSelectors should select correctly return if value is not an undefined', () => {
  const { get } = createSelectors({
    tileName: ['myTile', 'nested'],
    nesting: ({ id, type }) => [id, type],
  });

  const result = get(
    { myTile: { nested: { one: { two: false } } }},
    { id: 'one', type: 'two' }
  );

  expect(result).toBe(false);
});