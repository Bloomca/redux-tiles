# Calculator example

Let's build a calculator – we want to fetch offers based on value, but we want to display only calculated value, so while new offer is being calculated, we should show the latest calculated.

We'll need to store two sets of data – current value and next value. Both of these are sync, and they don't really need any fancy stuff inside them:

```javascript
import { createSyncTile } from 'redux-tiles';

const currentValuesTile = createSyncTile({
  type: ['calculator', 'values', 'current'],
  initialState: { value: 10 }
});

const nextValuesTile = createSyncTile({
  type: ['calculator', 'values', 'next'],
});
```

Note that we did not specify `fn` property – because we want params with which we invoke function, to be passed to the state, we don't have to specify it at all! So, default function looks like that:
```javascript
fn: ({ params }) => params
```

Next, we have to create an API call. The goal of redux-tiles library is to provide composable way to write less verbose Redux code, so we should try to atomize all actions, so this call will be responsible only for this single api request:

```javascript
const calculateOfferRequest = createTile({
  type: ['api', 'offer'],
  fn: ({ api, params }) => api.get('/offer', params),
  // nesting can be more complicated, than just list of params
  nesting: ({ value }) => {
    if (!value) {
      return ['default'];
    }
    
    return [value];
  },
  caching: true,
});
```

So, function is pretty simple, but we also add nesting, so we process many requests simultaneously (and no race conditions could be introduced here), and also, as calculator usually makes a lot of requests, it makes sense to cache them.
Nesting here is a little bit trickier than just returning list of arguments – in fact, you don't have to return even arrrays of the same length! Don't be afrad to use `default` values, selectors use the same `nesting` function to calculate path, so it will be resolved correctly.

And now, after we created all auxiliary tiles, we can create main business logic tile. It will accept new parameters for calculator, set them as next values, then perform api requests by dispatching `calculateOfferRequest` tile, and after, if next values are still the same, we set them as current values (we don't want to create junky change of offer details):

```javascript
const calculateOffer = createTile({
  type: ['calculator', 'calculateOffer'],
  fn: async ({ params, dispatch, actions, selectors, getState }) => {
    // set nextValues
    dispatch(actions.calculator.values.next(params));
    // calculate new offer
    await dispatch(actions.api.offer(params));
    // get next params, and if they are the same, change current
    // we have to do it, because another request might come, and
    // then we could introduce race condition
    const nextValues = selectors.calculator.values.next(getState());
    if (nextValues.value === params.value) {
      // after this dispatch we'll re-render offer
      dispatch(actions.calculator.values.current(params));
    }

    // we don't really have to return anything; we just want to dispatch
    // actions from this tile
    // but if you want, it is possible to add meaningful resolving params
    // and nesting for separation
  },
});
```

Now let's put everything together and create a store:

```javascript
import { createStore, applyMiddleware } from 'redux';
import { createEntities, createMiddleware } from 'redux-tiles';

const tiles = [
  currentValuesTile,
  nextValuesTile,
  calculateOfferRequest,
  calculateOffer
];

// we create store only from redux-tiles, so we don't have to specify
// second argument, which is a namespace in the store
const { actions, reducer, selectors } = createEntities(tiles);
const { middleware, waitTiles } = createMiddleware({ api, actions, selectors });

const store = createStore(
  reducer,
  applyMiddleware(middleware)
);
```

Now let's execute our code, in situation close to real. We'll dispatch one offer request, and then, after some time, another. Along the code we will look into current state:

```javascript
import { sleep } from 'delounce';

// 10, because we stated it in our initialState!
const { value } = selectors.calculator.values.current(store.getState()); 

// let's assume this request will take 200ms
store.dispatch(actions.calculator.calculateOffer({ value: 15 }));

await sleep(150);

// still 10, because only 150ms passed
const { value } = selectors.calculator.values.current(store.getState());

// 15, because calculateOffer changed it immediately
const { value } = selectors.calculator.values.next(store.getState());

// again, 200ms
store.dispatch(actions.calculator.calculateOffer({ value: 30 }));

await sleep(150);

// still 10, because old version was declined, and new has not arrived yet
const { value } = selectors.calculator.values.current(store.getState());

// 30, because calculateOffer changed it immediately
const { value } = selectors.calculator.values.next(store.getState());

await sleep(150);

// finally 30, because we have not dispatched other offer calculations
const { value } = selectors.calculator.values.current(store.getState());
```

## Links to implementation

- [complete code](https://github.com/Bloomca/redux-tiles/tree/master/examples/calculator)
- [tiles code](https://github.com/Bloomca/redux-tiles/tree/master/examples/calculator/calculator-tiles.js)
- [tests code](https://github.com/Bloomca/redux-tiles/tree/master/examples/calculator/__test__/app.spec.js)