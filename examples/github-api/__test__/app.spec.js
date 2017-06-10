import app from '../index';
// 10 second timeout – might take a whie!
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

test('wait Tiles should wait until we load all stories', async () => {
  const params = { id: 'bloomca' };
  app.store.dispatch(app.actions.gh_api.userWithRepos(params));
  await app.waitTiles();

  const state = app.store.getState();
  const { data } = app.selectors.gh_api.userWithRepos(app.store.getState(), params);
  expect(data.user.url).toBe('https://api.github.com/users/Bloomca');
  expect(data.repos).toBeInstanceOf(Array);
});
