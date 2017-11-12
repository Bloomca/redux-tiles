import { createTile } from 'redux-tiles';
import parseHeaders from './pagination';

// simple API request to users with caching, so we don't fetch same user
// twice. All users are nested by id, so their meta (`isPending`, etc)
// is independent
export const usersTile = createTile({
  type: ['gh_api', 'users'],
  fn: ({ api, params }) => api.get(`/users/${params.id}`).then(({ data }) => data),
  nesting: ({ id }) => [id],
  caching: true,
});

// fetch repos with pagination
// we have pretty deep nesting here:
// {
//   users: {
//     1: {
//       10: {
//         isPending: false,
//         data: { items: [...repos], pagination: { end: false } },
//         error: null,
//       },
//     },
//   },
// }
// and it allows us to keep repos for all possible scenario in one tile!
// so, user and org repos will be stored here, with the same logic for
// pagination
export const repositoresTile = createTile({
  type: ['gh_api', 'repos'],
  fn: ({ api, params: { type, id, pageSize = 10, pageNumber = 1 } }) => {
    return api.get(`/${type}/${id}/repos`, { page: pageNumber, per_page: pageSize }).then(x => {
      const pagination = parseHeaders(x.headers);
      return { items: x.data, pagination };
    });
  },
  nesting: ({ type, id, pageSize = 10, pageNumber = 1 }) => [type, id, pageNumber, pageSize],
});

// fetch repos until the end
// instead of putting logic for fetching here, we delegate
// it to the tile for fetching repos with pagination
// so we can implement both types – full list and list with
// pagination
export const drainRepositories = createTile({
  type: ['gh_api', 'drainRepos'],
  fn: async ({ actions, dispatch, params, selectors, getState }) => {
    let pageNumber = 1;
    let repos = [];
    while (true) {
      const { data: { pagination: { end }, items } } = await dispatch(actions.gh_api.repos({ ...params, pageNumber }));
      repos = repos.concat(items);

      pageNumber++;
      if (end) {
        return repos;
      }
    }
  }
});

// fetch user info and all his repos
// this is our main business logic for the application
// we only combine other tiles here
// also, these requests are independent, so we do them
// simultaneously
export const userWithRepos = createTile({
  type: ['gh_api', 'userWithRepos'],
  fn: async ({ dispatch, actions, params: { id }, selectors, getState }) => {
    const reposParams = { type: 'users', id };
    const [{ data: user }, { data: repos }] = await Promise.all([
      dispatch(actions.gh_api.users({ id })),
      dispatch(actions.gh_api.drainRepos(reposParams))
    ]);

    return { user, repos };
  },
});

export default [
  usersTile,
  drainRepositories,
  repositoresTile,
  userWithRepos,
];