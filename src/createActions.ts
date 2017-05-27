import { isArray } from 'lodash';
import { iterate, populateHash } from './helpers';
import { Tile, PromiseObject } from './modules/types';

export function createActions(modules: Tile[]) {
  // this storage will keep all promises
  // so if the request is already in progress,
  // we could still await it
  const promisesStorage: PromiseObject = {};
  const actions = iterate(modules).reduce((hash: any, module: Tile) => {
    const action = module.action;

    const processedAction = module.action.async
      // initialize promises storage for this instance
      ? module.action(promisesStorage)
      : module.action;
    processedAction.reset = action.reset;
    populateHash(hash, module.moduleName, processedAction);
    return hash;
  }, {});

  return { promisesStorage, actions };
}