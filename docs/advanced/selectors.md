# Selectors

We keep all our data in redux state – and all tiles are keeping their data under `type` namespace. It means that you can pretty easily access your data directly from the state object:

```js
import { createTile, createEntities } from 'redux-tiles';

const exampleTile = createTile({
  type: ['example', 'nested', 'tile'],
  ...
});

const tiles = [exampleTile];

// we specify namespace for tiles, it means that we will combine
// reducers with tilesReducer under this key
const { actions, reducer, selector } = createEntities(tiles, 'redux_tiles');

// we get this nesting in actions object
dispatch(actions.example.nested.tile());

// to access data, we can use the same nesting, with top-level name
// also, please note this will return null (if we have not dispatched
// action from this tile yet), in order to be consistent with tiles
// with nesting – we cannot prefill data for nested values
const result = state.redux_tiles.example.nested.tile;
```

So the pattern is pretty clear, right? So we can just access all our data directly!
Well, not that fast. Let's take into consideration nesting, and then try to reach our example tile again:

```js
const exampleTile = createTile({
  type: ['example', 'nested', 'tile'],
  nesting: ({ type, query }) => [type, query],
  ...
});

// let's try to access our data, with type and query
// this query might actually throw an error!
// by default, state will contain only an empty object,
// and all nested values will be presented _only_ in case
// we dispatched some actions with such parameters!
const result = state.redux_tiles.example.nested.tile.myType.myQuery;
```

So, it becomes a little bit trickier with nesting – we have to use something like [get method from lodash](https://lodash.com/docs/4.17.4#get), which safely goes through properties; but also, using such access means that we'd have to constantly check whether value was initialized or not, and to add default values everywhere.
Also, in case we would like to change namespace of reducer, we will have to spend some time to find all occurrences.

In order to solve all these problems and to abstract data accessing, we introduce concept of _selectors_. Selector is just a function, which retrieves your data somehow – and you are highly encouraged to write your own selectors! For instance, if you feel that you repeat yourself in something like "get id from application, if there is none, go to the latest record and if no luck again, take distributions and query them", it is a good sign to move all this functionality into `getId` selector. The recommended way to use selectors is to combine them via `createSelectors` or `createEntities`:

```js
import { createSelectors, createEntities } from 'redux-tiles';
import tiles from '../tiles';

const selectorsFromCreateSelectors = createSelectors(tiles);
const { selectors, actions, reducer } = createEntities(tiles);

expect(selectorsFromCreateSelectors).deepEqual(selectors); // true
```

Selectors have the same nesting structure, as actions, so a tile wth type `['some', 'type']` will be accessible through `selectors.some.type`. Selector function takes two arguments – the first one is state, and the second one is parameters (same as you pass as a first parameter to dispatched action of the tile) – and this thing will actually give you current state or default value, which is the following data structure:

```js
{
  isPending: false,
  fetched: false,
  data: null,
  error: null,
}
```

There is no default value for sync tiles, because we don't have any metadata there, and we are able to keep there anything (except `undefined`, as it is not accepted by redux store); so selectors for it solve only access to nested properties and reducer namespace problem. If you want to pass default value to sync tile, use `initialState` property.

Also, you can keep anything as `data` in async tile, even `null` or `undefined` – `fetched` field allows you to check whether request was proceed or not.

Your typical code using [connect](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options) will look like the following:

```js
// with direct access:
const mapStateToProps = (state, { params: { id } } => ({
  // in case of missing value will be undefined
  item: state.tiles.api.item[id],
});

// and using selectors
const mapStateToProps = state => ({
  // in case of missing value will be
  // {
  //   isPending: false,
  //   fetched: false,
  //   error: null,
  //   data: null,
  // }
  item: selectors.api.item(state, { id }),
});

export default connect(mapStateToProps)(Component);
```

## Why state without nesting by default is null?

As it was mentioned previously, by default tile without nesting sets it's value to null. While it is possible to set it to the typical data structure (for async tile, where we have metadata):

```js
{
  isPending: false,
  fetched: false,
  data: null,
  error: null,
}
```

We don't do it absolutely _intentionally_. The problem is that we'd get inconsistency with data, which is taken from tiles with nesting (we cannot guess which values will be there! Of course, we could add intrinsic getter, but it will make things much more complicated.) – so if you access data by hand, then at least you'd get _almost_ consistent result (almost – with nesting, you'll have have to specify your fallback in case of no value).

Once again, the recommended way to go is to use selectors, provided by tiles (and combined by `createSelectors` or `createEntities`).