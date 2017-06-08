# Calculator example

This is an example of some calculator's implementation. We have current values (for which we already have calculated offer) and next values (for which we would like to fetch and display offer), and one fake endpoint to calculate offers. Please, note, that API tile is extremely small and intended to be composed:

```javascript
const calculateOfferRequest = createTile({
  type: ['api', 'offer'],
  fn: ({ api, params }) => api.get('/offer', params),
  nesting: ({ value }) => [value],
  caching: true,
});
```

We specify only how to get data, how to store it and specify caching, that's it! And we decide which params to use inside another tile, which decides on everything. You can take a look at [tiles](./calculator-tiles.js) and [tests](./__test__/app.spec.js).

You can run it by yourself:
```bash
yarn install
yarn test # note time for the second test – caching should work!
```