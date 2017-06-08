import app from '../index';

test('current value should keep initial state in the beginning', () => {
  const { value } = app.selectors.calculator.values.current(app.store.getState());
  expect(value).toBe(10);
});

test('next value should change immediately after dispatching calculating offer', async () => {
  app.store.dispatch(app.actions.calculator.calculateOffer({ value: 15 }));
  setTimeout(() => {
    const { value } = app.selectors.calculator.values.next(app.store.getState());
    expect(value).toBe(15);
  }, 0);
});

test('current value should change after offer was calculated', async () => {
  await app.store.dispatch(app.actions.calculator.calculateOffer({ value: 15 }));
  const { value } = app.selectors.calculator.values.current(app.store.getState());
  expect(value).toBe(15);
});

test('offer should contain some amount after calculating under passed value', async () => {
  await app.store.dispatch(app.actions.calculator.calculateOffer({ value: 15 }));
  const { data } = app.selectors.api.offer(app.store.getState(), { value: 15 });
  expect(typeof data.amount).toBe('number');
});
