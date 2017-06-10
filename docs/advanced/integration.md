# Integration with existing Redux store

While for most cases redux-tiles should be sufficient for the whole redux store, it has some drawbacks (especially in complex asynchronous interaction), and maybe you would like to add it into existing project or you have to combine with another libraries, which provide their own reducers. It is not hard at all, and you just have to do couple more actions in order to achieve it.

## Reducer

The first thing you'd have to do – [combine reducers](http://redux.js.org/docs/recipes/reducers/UsingCombineReducers.html). Reducer, which you create from [createEntities](../api/createEntities.md) or [createReducers](../api/createReducers.md), won't be at the top level – it will be one level down, so we have to specify the name under which it will be stored, so all selectors will work properly:

```js
import { createEntities, createReducers } from 'redux-tiles';
import tiles from '../tiles';

const { reducer: reduxTilesReducer } = createEntities(tiles, 'redux_tiles');
// or
const reduxTilesReducer = createReducers(tiles);
```

Now all selectors will know, that they have to look one level deeper in order to find data. Let's combine this reducer with others:

```js
import { combineReducers, createStore } from 'redux';

const finalReducer = combineReducers({
  ...otherReducers,
  redux_tiles: reduxTilesReducer,
});
```

And that's it, we got combined reducer which we can pass to the `createStore` function, along with the initial state and middleware:

```js
import { createStore, applyMiddleware } from 'redux';
import { createMiddleware } from 'redux-tiles';
import tiles from '../tiles';

const { middleware } = createMiddleware(tiles);
const store = createStore(
  finalReducer,
  // to restore data on the client, usually something like
  // window.__INITIAL_STATE__
  initialState,
  applyMiddleware(middleware)
);
```

## Actions and Selectors

For actions and selectors we don't really have to do anything – after we pass correct namespace to `createReducers` or `createEntities`, it will make selectors work correctly.
Actions are not affected at all, we just have to integrate them into bigger actions and selectors objects:

```js
import { createEntities } from 'redux-tiles';
import tiles from '../tiles';

const {
  actions: tilesActions,
  selectors: tilesSelectors,
  reducer: tilesReducer
} = createEntities(tiles, 'redux_tiles');

export const actions = {
  ...otherActions,
  tiles: tilesActions,
};

export const selectors = {
  ...otherSelectors,
  tiles: tilesSelectors,
};
```
