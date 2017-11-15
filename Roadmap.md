# Roadmap

The goal of this project is to allow to write state management using redux in much less verbose way, especially asynchronous part -- all improvements here are directed to make it easier.

Feel free to create an issue, if you feel some feature will be helpful for a lot of users.

Last updated: 15/11/2017

## 0.9

- add `getData` function to `fn` arguments. It will return data of the current tile -- it will allow to avoid verbose constructions like:

```js
const currentData = selectors.todos.list(getState());
// it will become
const currentData = getData();
```

## 0.10

- add `update` parameter to the second argument of async tile action, so it will allow us to not to remove current data immediately, rather update it as soon as we have it

## 1.0

- switch to custom property in action object, instead of the function. It will allow to use with redux-thunk in existing codebases
- add support for generators -- `fn` in async tile should be able to actually execute generator functions. While it is not that helpful per se, but it allows to add niceties on top of it -- cancellation, pause/resume, etc (I think it is better to make an another library)
