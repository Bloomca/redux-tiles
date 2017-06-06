# Middleware Overview

[Middleware](http://redux.js.org/docs/advanced/Middleware.html) in Redux processes actions, so you might return not just plain objects with `type` and `payload` properties, but also promises, functions and so on – just handle it with appropriate middleware. There are several really popular libraries, but the most basic and popular, I think, is [redux-thunk](https://github.com/gaearon/redux-thunk), the most basic middleware to deal with async requests. While this is a great middleware, it is dead simple, and I'd recommend to use middleware from this library (also, I highly recommend to take a look at the source code of them – they are _really_ simple – [redux-tiles middleware](https://github.com/Bloomca/redux-tiles/blob/master/src/middleware.ts) and [redux-thunk middleware](https://github.com/gaearon/redux-thunk/blob/master/src/index.js)).

## createMiddleware API

`createMiddleware` does two things – creates actual middleware, and also exposes function to "wait" all dispatched promises. Let's look at the example:

```javascript
import { createMiddleware } from 'redux-tiles';
import { createStore, applyMiddleware } from 'redux';
import api from '../api';
import { actions, selectors, reducer } from '../entities';

const { middleware, waitTiles } = createMiddleware({ api, actions, selectors });

const store = createStore(reducer, applyMiddleware(middleware));
```

`createMiddleware` take object as a parameter, and this object will be desctructured and it's properties will be available inside `fn` of the tile – so it works like [dependency injection](https://en.wikipedia.org/wiki/Dependency_injection). It allows us to test our business logic really use, because we don't have to mock global imports, we just have to pass needed actions/selectors/etc.

While some might argue that it is actually anti-pattern, I personally think that it is a good strategy – less dependencies, more consistent access to other parts of state and dispatching other actions.

## waitTiles function and server-side rendering

Also, we get in returned object `waitTiles` function. What does it do? Well, this function gets active promises and waits for them – so if you dispatch 5 async modules, all of these promises will be collected by the middleware, and this function after invokation will wait for them. You can use it for server-side rendering – you do "dry-run" rendering first time, prefetching needed data in `componentWillMount`, then you await for `waitTiles()`, and after resolving render will give you markup with prefetched data!
Remember, though, that you have to instantiate new store for each request, otherwise this storage will be for requests, which will create a mess.
