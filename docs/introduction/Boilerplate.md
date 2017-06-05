# Redux's Boilerplate

While this library targets to eliminate this boilerplate, it is crucial to understand how it works under the hood – there is no magic, it is just a convenient abstraction; but without understanding you'll likely bump into some troubles, and will try to solve some problems in weird way. So, don't overlook basic stuff – also, there are plently of good resources on this topic, right from the creator of Redux (for example, free video courses, [1](https://egghead.io/series/getting-started-with-redux) and [2](https://egghead.io/courses/building-react-applications-with-idiomatic-redux)). [Official docs](http://redux.js.org/) are superb as well – take a look before diving into this library!

So, just to quickly refresh the principles of Redux, let's briefly create one small module. But first, let's recap general flow: redux has unidirectional data flow, which looks a little bit weird in the beginning – we create constants as unique identifiers, and then pass data from actions along with this constant, and then we put this data to it's own place in the store (each handler reacts only to the specific constant). Also, it is possible to trigger these actions only from the store instance, so it is "approved" by our store (which in case of React is stored inside context), and therefore we know for sure where this data came from. Later components (or just parts of the application – you can subscribe to parts of the store manually) just retrieve this data, and they have no power to mutate the state.

So, with this knowledge in mind, let's build a simple notification module in Redux. Let's assume we have predefined list of notifications and we just pass data to it, or set it to null, in case we close it (remember these annoying popups for accepting cookies?).

We will start with action:
```javascript
export const ADD_NOTIFICATION = 'ADD_NOTIFICATION';
export const REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION';

export const addNotification = ({ notification, id }) => {
  return {
    type: ADD_NOTIFICATION,
    payload: { notification, id },
  };
};

export const removeNotification = (id) => {
  return {
    type: REMOVE_NOTIFICATION,
    payload: { id },
  },
};
```

And now the reducer:
```javascript
import { ADD_NOTIFICATION, REMOVE_NOTIFICATION } from './actions';

const initialState = {
  cookies: null,
  login: null,
  details: null,
};

export const reducer = (state = initialState, action) {
  switch (action.type) {
    case ADD_NOTIFICATION: {
      const { id, notification } = action.payload;
      return {
        ...state,
        [id]: notification,
      }
    };
    case REMOVE_NOTIFICATION: {
      const { id } = action.payload;
      return {
        ...state,
        [id]: null
      }
    };
    default:
      return state;
  }
}
```

So, what is the problem here? It is not very long, and we now have guaranteed consistent update in our UI! Well, the problem is that it is fine for really small applications, but usually with growth of the application, it will get more hairy – because it is a lot of boilerplate code, there is a big chance that eventually old actions/reducers will be extended instead of creating small composable pieces. Also, combineReducers is usually performed only on the top level, so you will end up combining several UI states in the single reducer, or something like `notificationsUI`.

Consider the previous example, but now with redux-tiles:
```javascript
import { createSyncTile } from 'redux-tiles';

const notifications = createSyncTile({
  type: ['ui', 'notifications'],
  fn: ({ params: { notification = null } }) => notification,
  nesting: ({ id }) => [id],
});
```
You'll get the same constant for free, nice nesting functionality, and your reducer in the state will be nicely put under `state.ui.notifications`.

In the end I can recommend couple of rants about verbosity of Redux and analysis why is it so:
- [SOME PROBLEMS WITH REACT/REDUX by André Staltz](https://staltz.com/some-problems-with-react-redux.html)
- [Idiomatic Redux by Mark Erikson](http://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-1/) – pretty good resource to deep your knowledge about redux itself
- [Practice and Philosophy of Redux by Mark Erikson](http://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-2/) – analyzing of each part of Redux