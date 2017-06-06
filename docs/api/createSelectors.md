# createSelectors API

As it was stated in [createTile](./createTile.md), selectors object is exposed and can be queried against state without any problems. But by the same reasons as described in [createActions](./createActions.md), it is nice to have the same nesting as in `type` property, and this function takes care of it:

```javascript
import { createSelectors } from 'redux-tiles';
import tiles from '../tiles';

const selectors = createSelectors(tiles);
```

## Note on the top reducer

If you integrate redux-tiles into existing project, or you have other, non-tiled reducers, you have to specify namespace in [createEntities](./createEntities.md) or [createReducers](./createReducers.md), so that selectors will try to get correct data.