# Nesting

Very often we have entities which should be treated the same way (e.g. same caching, same requests, same operations performed on them before storing), but separated by some identificator (or maybe several). The canonical example is downloading items by id – one by one; usually we have a page for a specific item, which we download and then store in the state, separating it by id.

That's how it will look like in traditional redux with [redux-thunk middleware](https://github.com/gaearon/redux-thunk) – let's start with action:
```js
import api from '../api';
export const FETCH_ITEM_START = 'FETCH_ITEM_START';
export const FETCH_ITEM_FAILURE = 'FETCH_ITEM_FAILURE';
export const FETCH_ITEM_SUCCESS = 'FETCH_ITEM_SUCCESS';

export const fetchItem = ({ id }) => {
  return (dispatch) => {
    dispatch({
      type: FETCH_ITEM_START,
      payload: { id },
    });

    return api
      .get(`/api/item/${id}`)
      .then(data => dispatch({
        type: FETCH_ITEM_SUCCESS,
        payload: { data, id },
      }))
      .catch(error => dispatch({
        type: FETCH_ITEM_FAILURE,
        payload: { id },
        error,
      }));
  };
};
```

Have you noticed how each time we passed `payload: { id }` in each dispatch invokation? That's because we have to differentiate each request (so we know which request is being loading, and which is already done)! So in reducer we have to merge our state carefully:

```js
export const reducer = (state, action) => {
  switch (action.type) {
    case FETCH_ITEM_START:
      return {
        ...state,
        [action.payload.id]: {
          isPending: true,
          error: null,
          data: null,
        },
      };
    case FETCH_ITEM_FAILURE:
      return {
        ...state,
        [action.payload.id]: {
          isPending: false,
          error: action.error,
          data: null,
        },
      };
    case FETCH_ITEM_SUCCESS:
      return {
        ...state,
        [actions.payload.id]: {
          isPending: false,
          error: null,
          data: action.payload.data,
        },
      };
    default:
      return state;
  }
}
```

So, we had to merge everything by hand, and therefore it introduces couple of problems. First, we violate [DRY principle](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself), second, we add one more possible place for bugs, so we have to write tests for this functionality, and third, it is just verbose.

Redux-tiles aims to solve this exact problem with just one more line of code. The same exact code will look the following with using tiles:

```js
import { createTile } from 'redux-tiles';

export const itemTile = createTile({
  type: ['api', 'item'],
  fn: ({ api, params }) => api.get(`/api/item/${params.id}`),
  // we are supposed to return an array, and it can have any length
  // and it will be correctly merged to the whole deepness
  nesting: ({ id }) => [id],
  // as a free bonus, we can cache our responses, and they will be
  // cached also by `id` values
  caching: true,
});
```

This code will do exactly the same as was described in "raw" redux code – it will fetch given resource and put all metadata under `id` in the state.

Let's look at another example, pagination. Usually for pagination we specify two things – page size and page number. So let's code this tile:

```js
const itemsWithPaginationTile = createTile({
  type: ['api', 'items'],
  fn: ({ params, api }) => api.get('/api/items', {
    pageSize: params.pageSize,
    pageNumber: params.pageNumber,
  }),
  // we have more deep nesting here – it will be handled correctly!
  nesting: (para
  ms) => [params.pageSize, params.pageNumber],
  // pages will be cached independently
  caching: true,
});
```

Also, it works exactly the same way for sync tiles, so if you want to keep some sync data separated by some identifiers, this will suit you perfectly.

So, as you can see, redux-tiles relieves some of the burden from you – you don't have to test your merging implementation, and you can easily get caching for nested items.