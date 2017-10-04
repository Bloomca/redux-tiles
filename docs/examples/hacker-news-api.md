# HackerNews API with redux-tiles

Let's build a real API tiles for hacker news. We will create a simple functionality, which will allow us to download pages by category (e.g. top stories, or new stories), with items automatically downloaded and populated as well.
We will use official [HN API](https://github.com/HackerNews/API), which is hosted on firebase. API setup is out of scope of this tutorial, so if you have more questions, please use following links:
- [Implementation in this example](https://github.com/Bloomca/redux-tiles/blob/master/examples/hacker-news-api/api.js)
- [Firebase](https://firebase.google.com/)
- [Web setup](https://firebase.google.com/docs/web/setup)

We will start downloading list of stories by type. Hackernews API returns just an array of the size 500, we will add pagination to it later:

```javascript
export const storiesTile = createTile({
  type: ['hn_api', 'stories'],
  fn: ({ api, params }) => api.child(params.type).once('value').then(snapshot => snapshot.val()),
  nesting: ({ type }) => [type],
  caching: true,
});
```

Despite using Firebase, here we don't really want to do real-time updates, just for the sake of simplicity, so we don't subscribe or do something like that. We get 500 items for given type – so we can download `topstories`, `new` and other categories using just this tile. We also cache results, so we can declaratively invoke it each time we need just a page, and be sure that it won't be downloaded again.

Now let's create tile for a single item. It will just download a single item, placing it under id namespace:

```javascript
export const itemTile = createTile({
  type: ['hn_api', 'item'],
  fn: ({ api, params }) => api.child(`item/${params.id}`).once('value').then(snapshot => snapshot.val()) ,
  nesting: ({ id }) => [id],
  caching: true,
});
```

As you can see, the implementation is extremely similar to the previous item, `storiesTile`. The thing is that they are performing almost the same operation – request some API call, parse results (if needed – here we don't have to), set up nesting and caching – and, in fact, this is how it is supposed to be. The idea behind `redux-tiles` is that because of boilerplate-free code it is very cheap to create small "tiles", which represent atomic piece of functionality, and then combine them later.
Let's create tile for downloading list of items – there is no such endpoint, so we will have to compose existing tile:

```javascript
export const itemsTile = createTile({
  type: ['hn_api', 'items'],
  fn: ({ dispatch, actions, params }) =>
    Promise.all(params.ids.map(id =>
      dispatch(actions.hn_api.item({ id }))
    ))
});
```

We just iterate over ids and request all ids inside. If we want to perform only certain amount of simulatenous requests, we can chunkify these requests here (but for other tiles it will be completely abstracted).

And finally, now we can create functionality for returning stories by type with pagination. The logic is the following:
- get list of all stories for this type
- calculate ids for given page
- download all items for these ids
- nest them into `[type, pageNumber, pageSize]`

```javascript
export const itemsByPageTile = createTile({
  type: ['hn_api', 'pages'],
  fn: async ({ params: { type = 'topstories', pageNumber = 0, pageSize = 30 }, selectors, getState, actions, dispatch }) => {
    // we can always fetch stories, they are cached, so if this type
    // was already fetched, there will be no new request
    const { data } = await dispatch(actions.hn_api.stories({ type }));
    const offset = pageNumber * pageSize;
    const end = offset + pageSize;
    const ids = data.slice(offset, end);
    
    // download list of ids for given page
    await dispatch(actions.hn_api.items({ ids }));
    
    // populate ids with real values
    return ids.map(id => selectors.hn_api.item(getState(), { id }).data);
  },
  // we can safely nest them this way, and be sure that individual items will be cached
  // so, changing number of items on the page might not even require a single new request
  nesting: ({ type = 'topstories', pageNumber = 0, pageSize = 50 }) => [type, pageSize, pageNumber],
});
```

The last tile contains main business logic for our application, but it does not contain any direct api request, so if in the future response for some endpoint will change, or we will have to do different requests to get the same data, we can change it only inside these small tiles (parsing data or dispatching other small tiles).

Let's put it together now – we will need to create all entities, and then redux store with reducer and middleware.

```javascript
import { createStore, applyMiddleware } from 'redux';
import { createEntities, createMiddleware } from 'redux-tiles';

const tiles = [
  storiesTile,
  itemTile,
  itemsTile,
  itemsByPageTile
];

// we create store only from redux-tiles, so we don't have to specify
// second argument, which is a namespace in the store
const { actions, reducer, selectors } = createEntities(tiles);

// we will need `waitTiles` later to wait for all requests
const { middleware, waitTiles } = createMiddleware({ api, actions, selectors });

const store = createStore(
  reducer,
  applyMiddleware(middleware)
);
```

And now we can download our front page with top stories!

```javascript
// download first page of topstories
store.dispatch(actions.hn_api.pages({ type: 'topstories' }));

// wait all requests – here it is just a single one
await app.waitTiles();

// let's check that we downloaded 30 stories
const { data } = app.selectors.hn_api.pages(store.getState(), { type: 'topstories' });
assert(data.length, 30); // will be true!
```

## Links to implementation

- [complete code](https://github.com/Bloomca/redux-tiles/tree/master/examples/hacker-news-api)
- [tiles code](https://github.com/Bloomca/redux-tiles/blob/master/examples/hacker-news-api/hn-tiles.js)
- [tests code](https://github.com/Bloomca/redux-tiles/blob/master/examples/hacker-news-api/__test__/app.spec.js)