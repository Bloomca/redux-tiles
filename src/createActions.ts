import { isArray } from 'lodash';
import { iterate, populateHash } from './helpers';
import { Tile, PromiseObject } from './modules/types';

export function createActions(modules: Tile[]) {
  // this storage will keep all promises
  // so if the request is already in progress,
  // we could still await it
  const actions = iterate(modules).reduce((hash: any, module: Tile) => {
    populateHash(hash, module.moduleName, module.action);
    return hash;
  }, {});

  return actions;
}
