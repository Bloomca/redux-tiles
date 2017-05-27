import { isArray } from 'lodash';
import { iterate, populateHash } from './helpers';
import { Tile } from './modules/types';

export function createActions(modules: Tile[]) {
  return iterate(modules).reduce((hash: any, module: Tile) => {
    const action = module.action;

    const processedAction = module.action.async
      // initialize promises storage for this instance
      ? module.action()
      : module.action;
    processedAction.reset = action.reset;
    populateHash(hash, module.moduleName, processedAction);
    return hash;
  }, {});
}