# CreateActions API

As it was described in [createTile](./createTile.md), you can get action directly from the tile, and dispatch by yourself, there are no caveats at all. One problem, though, lies in the space of nesting – we can specify `type: ['ui', 'notifications', 'warning']`, but if we access actions directly, we would have to combine some common object by ourselves, to achieve something like `actions.ui.notifications.warning`. `createActions` solves exactly this problem – it iterates over the array of tiles, and based on the given type constructs this nested object.

So, let's see some example:

```javascript
import { createActions, createTile } from 'redux-tiles';

const userTile = createTile({
  type: ['user', 'data', 'get'],
  fn: someAction,
});
const tiles = [userTile];

const actions = createActions(tiles);
actions.user.data.get === userTile.action; // true
```

This function is a pure sugar, but it is nice to have them nested exactly the same way it is in the `type` property.

## Tiles parameter

`createActions` takes a single parameter, `tiles`, and it can be an array or an object of tiles. The next structure is allowed:

```javascript
const userTiles = [userLogin, userData, userPreferences];
const uiTiles = [notifications, popup];
const arrayTiles = [
  ...userTiles,
  ...uiTiles
];

const objectTiles = {
  userLogin,
  userData,
  userPreferences,
  notifications,
  popup
};
```
