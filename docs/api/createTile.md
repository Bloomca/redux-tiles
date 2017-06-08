# CreateTile API

This is the main function of the library – it is a factory, which creates you all needed entities: actions, reducer, constants and selectors. Also, "default" `createTile` is asynchronous (I personally find such modules more often, so it is a default version), and it supports this lifecycle out of the box.

The basic tile will look like this:
```javascript
import { createTile } from 'redux-tiles';

const { action, selectors, reducer, constants, reflect } = createTile({
  type: ['user', 'info'],
  fn: ({ api, params }) => api.get('/user/info', params),
});
```

The default data structure, which keeps data inside (and will be returned if we use `selectors.get`), is the following:
```javascript
{
  isPending: false, // true while your async function performing some actions
  data: { yourData: ... }, // data resolved from the promise, returned by your function
  error: null, // will be the error which was thrown from your function
}
```

You can't affect this structure at all – your data will go either to `data` field, or either to `error` in case of throwing an error. By this contract you can be sure inside your components the interface, so there is no way to have `isLoading`, `isPending`, `isUpdating` and so on – whatever seems more semantic for each use-case. Yes, it is not that elegant, but much more consistent; same argument for `data` field.

## API to create new tile

Now let's take a look closer into passed object when we create a new tile:

```javascript
import { createTile } from 'redux-tiles';

const userTile = createTile({
  // type will be reflected in store, so it will be stored
  // under state.hn_api.user (so the first element in the array
  // can serve like an umbrella!)
  type: ['hn_api', 'user'],
  
  // function for async tile should return a promise, otherwise it
  // will fail. function gets one parameter, object, which contains
  // all passed middleware, and params – object with which dispatched
  // function was invoked
  // e.g. here: dispatch(actions.hn_api.user({ id: 'someID' }));
  // result of the promise will be placed under `data` inside state
  fn: ({ api, params }) => api.get(`/api/user/${params.id}`),
  
  // nesting allows you to separate your data (first argument is params
  // from fn). It means that all requests will have their own isPending,
  // data and error, as well as caching
  // it is an optional parameter
  // arbitrary nesting is supported
  nesting: ({ id }) => [id],

  // this is an aggressive caching for specific item – if it was
  // downloaded, then it won't be downloaded again at all, unless
  // we will invoke with the second parameter `forceAsync: true`:
  // dispatch(actions.hn_api.user({ id: 'someID' }, { forceAsync: true }));
  caching: true,
});
```

## Caching

As it was already mentioned, you can set property `caching` to `true`, and it will make same requests to query only once, and after you will have to send an object with a key `forceAsync: true` as a second parameter to invoked function, to execute your function again.

But also there is another caching, which is enabled if you use [our middleware](./createMiddleware.md). It tracks all requests based on type of the module and nesting, and stores promises, and in case it was invoked again, it will simple wait existing promise, so you can await result without any additional requests. Because of that, you should be very careful on Node.js – please, instantiate store for each request, in case you want to dispatch some async requests.

## Function

Property `fn` is an obvious target to perform some API requests, but there are no restrictions on usage of it, so you can do whatever you want – starting from sleeping several seconds and to polling of some new data.

Let's implement both of these cases, starting with sleep. We will show notification for 5 seconds, and after close it:
```javascript
import { createTile } from 'redux-tiles';
import { sleep } from 'delounce';

const showNotification = createTile({
  type: ['ui', 'showNotifications'],
  fn: async ({ dispatch, actions, params }) => {
    dispatch(actions.ui.notifications(params));
    await sleep(5000);
    // let's assume that sending only id will close notification
    dispatch(actions.ui.notifications({ id: params.id }));

    // in this case this data is pretty much useless
    // but sometimes it is helpful
    return { closed: true };
  },
  // so we can check whether notification is going to be closed,
  // it is not really needed, but it costs nothing to us, so we can
  // remove/add it in no time
  nesting: ({ id }) => [id],
});
```

Now let's go to more complex example – polling of the user data. For example, we billed user, and now we are awaiting updated profile details:
```javascript
import { createTile } from 'redux-tiles';
import { sleep } from 'delounce';

const pollDetails = createTile({
  type: ['polling', 'details'],
  fn: async ({ dispatch, actions, params, selectors, getState }) => {
    while (true) {
      await sleep(3000);
      await dispatch(actions.user.data());
      const { data } = selectors.user.data(getState());
      if (data.card !== params.card) {
        // same thing – this one is not particularly helpful data,
        // but it might be useful
        return { card: data.card };
      }
    }
  },
});
```

Polling is a great example of hitting the boundaries of this library – it is not intended to solve complex asynchronous flows, it is all about composition of small units. So, if you need even more complicated behaviour, or some tweeks like stopping of the polling, etc, then I can recommend to take a look at something like [Redux-saga](https://github.com/redux-saga/redux-saga).
But if you have them just in couple of places, when you should be good sticking with redux-tiles.

## Returned object API

When we create a new tile, we get in response object with all needed entities. As you will see later, it is advised to use special utilities to combine them together, but it is possible to do it by hand, in case you need. So, let's take a closer look:

```javascript
import { createTile } from 'redux-tiles';

const {
  // this is an actual action, which you can dispatch if you want to
  // there is no magic behind it, except that it has a property `reset`,
  // which is a function to reset reducer to default state (synchronously)
  action,

  // reducer function. this one is really tricky – in order to use it correctly,
  // you would have to combine it by yourself (so array passed in `type` will
  // make it not that easy)
  // also, in case you want to combine it by yourself, keep in mind that
  // it can be attached only to the root without using `createReducers`
  //
  // so, to conclude, this one, unfortunately, has some magic and it is better
  // to combine using `createReducers` from this library
  reducer,

  // object with START, SUCCESS, FAILURE and RESET strings
  // strings are unique by using type
  // you can use them anywhere you want – for instance, in redux-saga
  constants,

  // object with two methods – get and getAll
  // get can get nested data, while getAll returns you all data
  // despite of nesting. getAll is a very rare function, you
  // will be good with just get in 99%
  selectors,

  // passed `type` property. can be also reached via `reflect` property
  tileName,

  // object which you passed to `createTile`. that's the way to get
  // your functions and to test them
  reflect
} = createTile({
  type: ['api', 'get', 'client'],
  fn: ({ api }) => api.get('/client/'),
});
```

In fact, you likely won't need to get any of those data from a tile, because there are utilities to combine all of them together, but it is helpful for understanding, that under the hood all components are presented.
