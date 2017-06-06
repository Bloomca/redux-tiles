# CreateSyncTile API

CreateSyncTile is very similar to [createTile](./createTile.md), but does not provide asynchronous functionality. Because of that, it is a little bit simpler – there is no caching, and only two constants – SET and RESET.

The basic sync tile will look like that:
```javascript
import { createSyncTile } from 'redux-tiles';

const nofitications = createSyncTile({
  type: ['ui', 'notifications'],
  // actually, if you are fine just passing params into the store, you
  // can omit it – default function has exactly this functionality
  fn: ({ params }) => params,
});
```

Because there is no async actions under the hood, there is also no related data structure – what you return from your function, will go straight to the state (and will be returned from selector's function).

Let's take a look at a little bit more extensive example:

```javascript
import { createSyncTile } from 'redux-tiles';

const chooseParams = createSyncTile({
  // type works exactly as in `createTile` – will be nested in store,
  // and `createEntities` will put it under this namespace in actions/selectors
  type: ['ui', 'params'],

  // while you have to perform only sync operations to return some value,
  // you can dispatch other actions
  // so, for instance, you can do self-closing notifications (e.g. dispatching
  // the same tile action), or send some tracking – but be careful, it is
  // very easy to introduce some race-conditions – for complex async stuff
  // consider using something like RxJS or redux-saga
  fn: ({ params }) => {
    return params.data;
  },

  // same as in `createTile` – separate data, so they will stored inside
  // store independently
  nesting: ({ type }) => [type],
});
```
