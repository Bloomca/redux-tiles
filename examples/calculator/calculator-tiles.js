import { createTile, createSyncTile } from 'redux-tiles';

// we want to use `params` variable from `fn` as a returning value
// so we can omit `fn` at all – it is a default behaviour!
const currentValuesTile = createSyncTile({
  type: ['calculator', 'currentValues'],
  initialState: { value: 10 }
});

const nextValuesTile = createSyncTile({
  type: ['calculator', 'nextValues'],
});

// this is an api call tile
// note how isolated it is – it's only responsibility
// is to call api and to store this info, along with caching
const calculateOfferRequest = createTile({
  type: ['api', 'offer'],
  fn: ({ api, params }) => api.get('/offer', params),
  // nesting can be more complicated, than just list of params
  nesting: ({ value }) => {
    if (!value) {
      return ['default'];
    }
    
    return [value];
  },
  caching: true,
});

// this is a "business logic" tile
// it updates future values
// make an api call for offer
// and changes current values, if there is
// no race condition 
const calculateOffer = createTile({
  type: ['calculator', 'calculateOffer'],
  fn: async ({ params, dispatch, actions, selectors, getState }) => {
    // set nextValues
    dispatch(actions.calculator.nextValues(params));
    // calculate new offer
    await dispatch(actions.api.offer(params));
    // get next params, and if they are the same, change current
    // we have to do it, because another request might come, and
    // then we could introduce race condition
    const nextValues = selectors.calculator.nextValues(getState());
    if (nextValues.value === params.value) {
      // after this dispatch we'll re-render offer
      dispatch(actions.calculator.currentValues(params));
    }

    // we don't really have to return anything; we just want to dispatch
    // actions from this tile
    // but if you want, it is possible to add meaningful resolving params
    // and nesting for separation
  },
});

export default [
  currentValuesTile,
  nextValuesTile,
  calculateOfferRequest,
  calculateOffer
];