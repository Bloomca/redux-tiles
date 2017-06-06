# createEntities API

All three entities ([createActions](./createActions.md), [createReducers](./createReducers.md) and [createSelectors](./createSelectors.md)) function have pretty similar API – so, instead of writing about 5 six of code, we can just write 2. This is the whole idea of this function, and the following examples illustrates it:

```javascript
import { createEntities } from 'redux-tiles';
import tiles from '../tiles';

// in case you use _only_ redux-tiles, feel free to keep it
// on the top level, and just omit second argument
const { actions, reducer, selectors } = createEntities(tiles, 'redux_tiles');
```

## The second argument

The second argument (`redux_tiles` here) is optional, but necessary if you want to put your reducer under some namespace (so, integrate it with other reducers). In this case it will be performing all selectors under this namespace, and for correct work you have to combine this reducer under this key:

```javascript
import { combineReducers } from 'redux';
import { reduxTileReducer } from '../entities';
import reducers from './reducers';

const reducer = combineReducers({
  ...reducer,
  redux_tiles: reduxTileReducer,
});
```