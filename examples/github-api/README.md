# Github API with redux-tiles

This examples shows one can build a data layer with `redux-tiles` to grab user info and drain all his repositories. Please, note, in case you will try it by yourself, that github has rate limiting for 60 requests.

Tiles code is located in [github-tiles.js](./github-tiles.js) file, and code is executed in [test file](__test__/app.spec.js).

You can run it by yourself:
```bash
yarn install
yarn test # note time for the second test – caching should work!
```