import { createTile } from 'redux-tiles';

export const storiesTile = createTile({
  type: ['hn_api', 'stories'],
  fn: ({ api, params }) => api.child(params.type).once('value').then(snapshot => snapshot.val()),
  // we separate list of stories by type, so we can reuse it for different types
  // e.g. topstories, new, etc
  nesting: ({ type }) => [type],
  // with active caching we can safely fetch it each time for each page
  // no additional requests will be done
  caching: true,
});

export const itemTile = createTile({
  type: ['hn_api', 'item'],
  fn: ({ api, params }) => api.child(`item/${params.id}`).once('value').then(snapshot => snapshot.val()) ,
  nesting: ({ id }) => [id],
  caching: true,
});

export const itemsTile = createTile({
  type: ['hn_api', 'items'],
  fn: ({ dispatch, actions, params }) =>
    Promise.all(params.ids.map(id =>
      dispatch(actions.hn_api.item({ id }))
    ))
  // there is no need to cache this instance, because caching will
  // work one layer down – when we will fetch individual items
});

export const itemsByPageTile = createTile({
  type: ['hn_api', 'pages'],
  fn: async ({ params: { type = 'topstories', pageNumber = 0, pageSize = 30 }, selectors, getState, actions, dispatch }) => {
    // we can always fetch stories, they are cached, so if this type
    // was already fetched, there will be no new request
    const { data } = await dispatch(actions.hn_api.stories({ type }));
    const offset = pageNumber * pageSize;
    const end = offset + pageSize;
    const ids = data.slice(offset, end);
    await dispatch(actions.hn_api.items({ ids }));
    return ids.map(id => {
      return selectors.hn_api.item(getState(), { id }).data
    });
  },
  // we can safely nest them this way, and be sure that individual items will be cached
  // so, changing number of items on the page might not even require a single new request
  nesting: ({ type = 'topstories', pageNumber = 0, pageSize = 50 }) => [type, pageSize, pageNumber],
});

// same strategy for user, as for the item
export const userTile = createTile({
  type: ['hn_api', 'user'],
  fn: ({ api, params }) => api.child(`user/${params.id}`).once('value').then(snapshot => snapshot.val()),
  nesting: ({ id }) => [id],
});

export default [
  storiesTile,
  itemTile,
  itemsTile,
  itemsByPageTile,
  userTile,
];
