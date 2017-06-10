# Example

This is an example how the library works together. It is a pretty simple example; if you need something more specific, please go to [examples](../examples/README.md), or for some specific parts to the [API part](../api/README.md). We will build a simple store to fetch documents, and after we fetch them, we will show notifications for 5 seconds, and then close it.

```javascript
import { createEntities, createTile, createSyncTile, createMiddleware } from 'redux-tiles';
import { createStore, applyMiddleware } from 'redux';
import { sleep } from 'delounce';
import api from '../api';

// async tile, which will query the api, and will automatically populate
// isPending while it is processing, and put result to `data` or `error`
// field, depending how promise will be resolved
const documents = createTile({
  type: ['documents', 'api'],
  fn: ({ api, params }) => api.fetch(`/documents/${params.type}`),
  // we nest documents by type, so requests for different types
  // are independent
  nesting: ({ type }) => [type],
});

// sync tile, which does not perform any async operations. in fact, we
// still can dispatch async actions, but we are not allowed to wait for
// them – result from this function will be put under corresponding state
const notifications = createSyncTile({
  type: ['ui', 'notifications'],
  fn: ({ params }) => params.data,
  nesting: ({ type }) => [type],
});

// this tile will be async, but it won't perform direct api requests
// instead, it will dispatch other tiles; redux-tiles encourages you
// to separate your logic to small parts, so it is easy to combine it
// and replace/remove parts later
const fetchDocumentWithNotification = createTile({
  type: ['documents', 'fetchWithNotification'],
  fn: async ({ dispatch, actions, params: { type } = {} }) => {
    // we dispatch other tile, instead of downloading
    // document right here – it allows us to compose
    // small parts of our logic much easier
    await dispatch(actions.api.documents({ type }));
    const data = `Document ${type} was downloaded!`;
    dispatch(actions.ui.notifications({ type, data }));
    
    await sleep(params.timeout || 5000);
    // sending type without data we will close notification
    dispatch(actions.ui.notifications({ type: params.type });

    return { ourData: 'some' };
  },
  nesting: ({ type }) => [type],
});

const tiles = [documents, notifications, fetchDocumentWithNotification];

const { acttons, reducer, selectors } = createEntities(tiles);
const { middleware, waitTiles } = createMiddleware({ actions, selectors });
const store = createStore(reducer, applyMiddleware(middleware));

// we dispatch only the most complicated action – this tile is the "essense" of
// the application, and it only composes other tiles, which have their own
// single responsibility – fetch documents and show notifications
store.dispatch(actions.documents.fetchWithNotification({ type: 'terms' }));

// this function will wait all dispatched actions, which can be used in
// server-side rendering
await waitTiles();
// let's dispatch another notification, to take a look 
store.dispatch(actions.ui.notifications({ type: 'agreement', data: 'Our agreement!' }));

// let's print our final store
console.log(JSON.stringify(store.getState(), null, 2));
/*

{
  documents: {
    api: {
      terms: {
        isPending: false,
        data: {
          url: 'https://example.com/terms.pdf',
          size: 512
        },
        error: null,
      },
    },
    fetchWithNotification: {
      terms: {
        isPending: false,
        data: { ourData: 'some' },
        error: null,
      },
    },
  },
  ui: {
    notifications: {
      terms: undefined,
      agreement: 'Our agreement!',
    },
  },
}
*/
```