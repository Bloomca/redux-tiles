# Redux-Tiles

[![Build Status](https://travis-ci.org/Bloomca/redux-tiles.svg?branch=master)](https://travis-ci.org/Bloomca/redux-tiles)
[![npm version](https://badge.fury.io/js/redux-tiles.svg)](https://badge.fury.io/js/redux-tiles)

Redux is an awesome library to keep state management sane on scale. The problem, though, is that it is toooo verbose, and often you'd feel like you are doing literally the same thing again and again. This library tries to provide minimal abstraction on top of Redux, to allow easy composability, easy async requests, and sane testability.

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
})
```
