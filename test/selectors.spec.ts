import { createSelectors, DEFAULT_REDUCER } from '../src/modules/selectors';

test('createSelectors should select with nesting', () => {
  const { get } = createSelectors({
    moduleName: 'myTile',
    nesting: () => ['some', 'another']
  });

  const result = get(
    undefined,
    { [DEFAULT_REDUCER]:
      { myTile: { some: { another: 23 } } }
    }
  );
  expect(result).toBe(23);
});

test('createSelectors should correctly select with combining reducers', () => {
  const { get } = createSelectors({
    moduleName: ['myTile', 'nested'],
    nesting: () => ['some', 'another']
  });

  const result = get(
    undefined,
    { [DEFAULT_REDUCER]:
      { myTile: { nested: { some: { another: 23 } } } }
    }
  );
  expect(result).toBe(23);
});

test('createSelectors should select correctly with params as a function', () => {
  const { get } = createSelectors({
    moduleName: ['myTile', 'nested'],
    nesting: ({ id, type }) => [id, type],
  });

  const result = get(
    'my prefix',
    { ['my prefix']: { myTile: { nested: { one: { two: 125 } } }}},
    { id: 'one', type: 'two' }
  );

  expect(result).toBe(125);
});

test('createSelectors should select correctly return if value is not an undefined', () => {
  const { get } = createSelectors({
    moduleName: ['myTile', 'nested'],
    nesting: ({ id, type }) => [id, type],
  });

  const result = get(
    'my prefix',
    { ['my prefix']: { myTile: { nested: { one: { two: false } } }}},
    { id: 'one', type: 'two' }
  );

  expect(result).toBe(false);
});