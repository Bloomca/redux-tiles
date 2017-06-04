# HN API with redux-tiles

This is an example, how one can implement redux layer with redux-tiles. [This official reference](https://github.com/HackerNews/API) was used. Current implementation supports fetching different pages of different types of pages (e.g. top stories, news, etc), with support of caching.
Tiles code is located in [hn-tiles.js](./hn-tiles.js) file, with extensive number of commentaries.

You can run it by yourself:
```bash
yarn install
yarn test # note time for the second test – caching should work!
```