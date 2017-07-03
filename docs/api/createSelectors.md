# createSelectors API

As it was stated in [createTile](./createTile.md), selectors object is exposed and can be queried against state without any problems. But by the same reasons as described in [createActions](./createActions.md), it is nice to have the same nesting as in `type` property, and this function takes care of it:

```javascript
import { createSelectors } from 'redux-tiles';
import tiles from '../tiles';

const selectors = createSelectors(tiles);
```

## Note on the top reducer

If you integrate redux-tiles into existing project, or you have other, non-tiled reducers, you have to specify namespace in [createEntities](./createEntities.md) or [createReducers](./createReducers.md), so that selectors will try to get correct data.

## Tiles parameter

`createActions` takes a single parameter, `tiles`, and it can be an array or an object of tiles. The next structure is allowed:

```javascript
const userTiles = [userLogin, userData, userPreferences];
const uiTiles = [notifications, popup];
const arrayTiles = [
  ...userTiles,
  ...uiTiles,
];

const objectTiles = {
  userLogin,
  userData,
  userPreferences,
  notifications,
  popup,
};
```

To learn more about actual selector functions, please read [advanced guide](../advanced/selectors.md). It addresses questions like why do we need such functions and how to use them.
