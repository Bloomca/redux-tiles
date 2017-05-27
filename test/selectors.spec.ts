import { createSelectors, DEFAULT_REDUCER } from '../src/modules/selectors';

test('createSelectors should select with nesting', () => {
  const { get } = createSelectors({
    moduleName: 'myModule',
    nesting: () => ['some', 'another']
  });

  const result = get(undefined, { [DEFAULT_REDUCER]: { myModule: { some: { another: 23 } } }});
  expect(result).toBe(23);
});

test('createSelectors should correctly select with combining reducers', () => {
  const { get } = createSelectors({
    moduleName: ['myModule', 'nested'],
    nesting: () => ['some', 'another']
  });

  const result = get(undefined, { [DEFAULT_REDUCER]: { myModule: { nested: { some: { another: 23 } } }}});
  expect(result).toBe(23);
});