# createReducers API

Reducers are pretty tricky in this library – in order to select path correctly, we have to specify under which namespace reducer will be combined. By default it is empty, and this case is suitable only if you put your tiles reducer on the top level. However, if you are integrating into existing project, or with other reducers, when you would have to specify this namespace as a second argument.

```javascript
import { createReducers } from 'redux-tiles';
import tiles from '../tiles';

// in case you use _only_ redux-tiles, feel free to keep it
// on the top level, and just omit second argument
const reducer = createReducer(tiles, 'redux_tiles');
```

One might ask, why we specify namespace here, if it affects only selectors? Well, we combine reducers, and we have to provide correct namespace, and therefore it is more correct to provide it here – here is a reason, not just a consequence, as in selectors.

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
