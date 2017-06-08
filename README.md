# Redux-Tiles

[![Build Status](https://travis-ci.org/Bloomca/redux-tiles.svg?branch=master)](https://travis-ci.org/Bloomca/redux-tiles)
[![npm version](https://badge.fury.io/js/redux-tiles.svg)](https://badge.fury.io/js/redux-tiles)

Redux is an awesome library to keep state management sane on scale. The problem, though, is that it is toooo verbose, and often you'd feel like you are doing literally the same thing again and again. This library tries to provide minimal abstraction on top of Redux, to allow easy composability, easy async requests, and sane testability.

>**[More about rationale behind this library](http://blog.bloomca.me/2017/06/02/why-i-created-redux-tiles-library.html)**<br>
>**[Examples](./examples)**
> - [hacker news API](./examples/hacker-news-api)
> - [calculator](./examples/calculator)

## Installation

To install latest stable version, run:
```shell
npm install --save redux-tiles
```

This package was built with the idea in mind, that people will use it usually using some bundling tool – [Webpack](https://webpack.js.org/), [Browserify](http://browserify.org/) or [Rollup](http://rollupjs.org/). The package itself is written in TypeScript, and therefore provides typings out of the box.

If you for some reason don't use bundler, you can use UMD builds, which are located in [dist folder](https://unpkg.com/redux-tiles@0.4.7/dist/). Just include it in your page via `script` tag, and then you will have it under `window.ReduxTiles` global variable.


## TOC:

- [Example of use](#user-content-example-of-use)
- [Rationale](#user-content-rationale)
- [Integration API](#user-content-integration-api)
- [Tiles API](#user-content-tiles-api)
- [Nesting](#user-content-nesting)
- [Middleware](#user-content-middleware)
- [Server-side Rendering](#user-content-server-side-rendering)
- [Selectors](#user-content-selectors)
- [Tests](#user-content-tests)

## Example of use

```javascript
import { createTile, createSyncTile } from 'redux-tiles';

// sync tile to store information without any async stuff
const loginStatus = createSyncTile({
  type: ['user', 'loginStatus'],
  fn: ({ params: status }) => ({
    status,
    timestamp: Date.now(),
  }),
});

// request to the server
// it is absolutely separated, so it is very easy
// to compose different requests
const authRequest = createTile({
  type: ['user', 'authRequest'],
  fn: ({ params, api, dispatch, actions }) => api.post('/login', params),
});

// actual business logic
const authUser = createTile({
  type: ['user', 'auth'],
  fn: async ({ params, api, dispatch, actions, selectors, getState }) => {
    // login user
    await dispatch(actions.tiles.user.authRequest(params));
    
    // check the result
    const { data: { id }, error } = selectors.tiles.user.authRequest(getState());

    if (error) {
      throw new Error(error);
    }

    // set up synchronously user status
    dispatch(actions.tiles.user.loginStatus({ true }));

    return true;
  },
});
```

## Rationale

There are enough projects around to keep your state management clean (for [example](https://github.com/erikras/ducks-modular-redux)), but they are mostly about organizing, rather than removing burden of repetitive stuff from the developer. Other packages offer you full-fledge integration with REST-API, [normalizing](https://github.com/paularmstrong/normalizr) your entities, building relations between models, etc. There is nothing like this here – in fact, if you need something like this, with the ability to query your local "database", I highly advise you to create your own solution, which will be custom-tailored to your specific problem.

This package focuses on very basic blocks, which are good for pretty simple applications (e.g. login/logout, fetch client data, set up calculator values).

## Integration API

Despite being easy-to-use package to write new modules, you'd have to do some work to integrate it into your project. In a nutshell, you have to have a middleware which will handle returned functions from dispatched actions (one is provided in this package, but [redux-thunk](https://github.com/gaearon/redux-thunk) will suffice as well), and then you have to combine all modules to create actions & reducers.
It is better to see in a small example:

```javascript
import { createTile, createEntities, createMiddleware } from 'redux-tiles';
import { createStore, applyMiddleware } from 'redux';

const firstTile = createTile({
  type: ['client', 'data'],
  fn: ({ api, params}) => api.get('/client/info'),
});

const tiles = [
  firstTile,
];

const { actions, reducer, selectors } = createEntities(tiles);
const { middleware } = createMiddleware({ actions, selectors });

createStore(reducer, applyMiddleware(middleware));
```

## Tiles API

Tiles are the heart of this library. They are intended to be very easy to use, compose and to test.
There are two types of tiles – asynchronous and synchronous. Modern applications are very dynamic, so async ones will be likely used more often.

```javascript
import { createTile } from 'redux-tiles';

const photos = createTile({
  // they will be structured api.photos inside redux state,
  // and also available under actions and selectors as:
  // actions.tiles.api.photos
  type: ['api', 'photos'],
  
  
  // params is an object with which we dispatch the action
  // you can pass only one parameter, so keep it as an object
  // with different properties
  //
  // all other properties are from your middleware
  // fn expects promise out of this function
  fn: ({ params, api }) => api.get('/photos', params),
  
  
  // to nest data:
  // { 5:
  //    10: {
  //      isPending: true,
  //      data: null,
  //      error: null,
  //   },
  // },
  // if you save under the same nesting array, data will be replaced
  // other branches will be merged
  nesting: (params) => [params.page, params.count],


  // unless we will invoke with second parameter object with asyncForce: true,
  // it won't be requested again
  // dispatch(actions.tiles.api.photos(params, { asyncForce: true }))
  caching: true,
});
```

We also sometimes want to keep some sync info (e.g. list of notifications), or we want to store some numbers 

```javascript
import { createSyncTile } from 'redux-tiles';

const notifications = createSyncTile({
  type: ['notifications'],
  
  
  // all parameters are the same as in async tile
  fn: ({ params, dispatch, actions }) => {
    // we can dispatch async actions – but we can't wait
    // for it inside sync tiles
    dispatch(actions.tiles.user.dismissTerms());

    return {
      type: params.type,
      data: processData(params.data),
    };
  },
  
  
  // nesting works the same way
  nesting: ({ type }) => [type],
});
```

## Nesting

Very often we have to separate some info, and with canonical redux we have to write something like this:
```javascript
case ACTION.SOME_CONSTANT:
  return {
    ...state,
    [action.payload.id]: {
      [action.payload.quantity]: {
        ...state[action.payload.id],
        ...action.payload.data,
      },
    },
  };
```

Or with `Object.assign`, which will make it even less readable. This is a pretty common pattern, and also pretty error prone – so we have to cover such code with unit-tests, while in reality they don't do a lot of intrinsic logic – just merge. Of course, we can use something like `lodash.merge`, but it is not always suitable. In tiles we have `nesting` property, in which you can specify a function from which you can return an array of nested values. The same code as above:

```javascript
const infoTile = createTile({
  type: ['info', 'storage'],
  
  // params here and in nesting are the same object
  fn: ({ params, api }) => api.get('/storage', params),
  
  nesting: ({ quantity, id }) => [id, quantity],
});
```

## Middleware

In order to use this library, you have to apply middleware, which will handle functions returned from dispatched actions. Very basic one is provided by this package:

```javascript
import { createMiddleware } from 'redux-tiles';

// these are not required, but adding them allows you
// to do Dependency Injection pattern, so it is easier to test
import actions from '../actions';
import selectors from '../selectors';

// it is a good idea to put API layer inside middleware, so
// you can easily separate client and server, for instance
import api from '../utils/api';


// this object is optional. every property will be available inside
// `fn` of all tiles
// also, `waitTiles` is helpful for server-side-rendering
const { middleware, waitTiles } = createMiddleware({ actions, selectors, api });
applyMiddleware(middleware);
```

Also, [redux-thunk](https://github.com/gaearon/redux-thunk) is supported, but with it you can't provide your own properties. There is nothing bad to just import actions and selectors on top of the files, but then testing might require much more mocking, which can make your tests more brittle.

## Server-side Rendering

Redux-tiles support requests on the server side. In order to do that correctly, you are supposed to create actions for each request in Node.js. Redux-Tiles has caching for async requests (and keeps them inside middleware, so they are not shared between different user requests) – it keeps list of all active promises, so you might accidentaly share this part of the memory with other users!

```javascript
import { createMiddleware, createEntities } from 'redux-tiles';
import { createStore, applyMiddleware } from 'redux';
import tiles from '../../common/tiles';

const { actions, reducer, selectors } = createEntities(tiles);
const { middleware, waitTiles } = createMiddleware({ actions, selectors });
const store = createStore(reducer, {}, applyMiddleware(middleware));

// this is a futile render. It is needed only to kickstart requests
// unfortunately, there is no way to avoid it
renderApplication(req);

// wait for all requests which were fired during the render
await waitTiles();

// this time you can safely render your application – all requests
// which were in `componentWillMount` will be fullfilled
// remember, `componentDidMount` is not fired on the server
res.send(renderApplication(req));
```

There is also a package [delounce](https://github.com/Bloomca/delounce), from where you can get `limit` function, which will render the application if requests are taking too long.

Examples are coming soon!

## Selectors

All tiles provide selectors. After you've collected all tiles, invoke `createSelectors` function with possible change of default namespace, and after you can just use it based on the passed type:

```javascript
import { createTile, createSelectors } from 'redux-tiles';

const tile = createTile({
  type: ['user', 'auth'],
  fn: ...,
  nesting: ({ id }) => [id],
});

const tiles = [tile];

const selectors = createSelectors(tiles);

// second argument is params with which you dispatch action – it will get data
// for corresponding nesting
const { isPending, data, error } = selectors.user.auth(state, { id: '456' });
```

## Tests

Almost all business logic will be contained in "complex" tiles, which don't do requests by themselves, rather dispatching other tiles, composing results from them. It is very important to pass all needed functions via middleware, so you can easily mock it without relying on other modules. All passed data is available in tiles via `reflect` property.

```javascript
import { createTile } from 'redux-tiles';

const params = {
  type: ['auth', 'token'],
  fn: ({ api, params }) => api.post('/token', params),
};
const tile = createTile(params);

// same object
assert(tile.reflect === params); // true
```

## Contributing

All suggestions or participating are welcome! Also, if you have any idea about improving API, or bringing some common functionality, don't hesitate, but please create an issue!

## LICENSE

MIT
