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
  // this function will be available under actions.ui.params
  // so, for instance, you can do self-closing notifications (e.g. dispatching
  // the same tile action), or send some tracking – but be careful, it is
  // very easy to introduce some race-conditions – for complex async stuff
  // consider using something like RxJS or redux-saga
  fn: ({ params }) => {
    return params.data;
  },

  // alternatively, if you perform some actions on existing data,
  // it might be useful to write more declarative actions
  // they have exactly the same signature and dispatch returned data
  // to the tile; they will be available under
  // actions.ui.params.add and actions.ui.params.remove
  fns: {
    add: ({ params, selectors, getState}) => {
      const list = selectors.notifications(getState(), params);
      return list.concat(params);
    },
    remove: ({ params, selectors, getState}) => {
      const list = selectors.notifications(getState(), params);
      return list.filter(({ id }) => id !== params.id);
    },
  },

  // same as in `createTile` – separate data, so they will stored inside
  // store independently
  nesting: ({ type }) => [type],

  // initial state to put into reducer. If you store list of elements,
  // and don't want to check whether type of data is array or object,
  // use this property
  initialState: [],
});
```

## Example

Let's create a tile for todoMVC application. We have to perform a lot of
listing list of all notifications which were triggered. We won't remove them here for the sake of simplicity, but we can easily add it with filtering.

```javascript
import { createSyncTile } from 'redux-tiles';

export const todosTile = createSyncTile({
  type: ['todos', 'list'],
  // to create more declarative function names, we will use
  // fns property. all functions from this object will be
  // attached to main action, so they will be available under
  // actions.todos.list.%function%
  fns: {
    // this function will be available under
    // actions.todos.list.add
    add: ({ params, getData }) => {
      // getData is a special function which returns current value
      // it is equivalent for the following:
      // const list = selectors.todos.list(getState());
      const list = getData();
      const newItem = {
        ...params,
        completed: false,
        id: Math.random(),
      };

      return list.concat(newItem);
    },
    // this function will be available under
    // actions.todos.list.remove
    remove: ({ params, selectors, getState }) => {
      const list = selectors.todos.list(getState());
      return list.filter(item => item.id !== params.id);
    },
    // this function will be available under
    // actions.todos.list.toggle
    toggle: ({ params, selectors, getState }) => {
      const list = selectors.todos.list(getState());
      return list.map(todo => todo.id === params.id
        ? { ...todo, completed: !todo.completed }
        : todo
      );
    }
  },
  // we state initial state as [], so we don't have to check
  // the type of data (we are sure that it will be an array)
  initialState: [],
});
```

## More information

* [Nesting](../advanced/nesting.md)
* [Selectors](../advanced/selectors.md)
