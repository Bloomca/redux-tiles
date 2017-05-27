import { iterate, populateHash } from './helpers';
import { Tile } from './modules/types';
import { DEFAULT_REDUCER } from './modules/selectors';

export function createSelectors(modules: Tile[]|{ [key:string]: Tile }, topReducer = DEFAULT_REDUCER) {
  return iterate(modules).reduce((hash, module: Tile) => {
    const selector: any = module.selectors.get.bind(null, topReducer);
    selector.getAll = module.selectors.getAll.bind(null, topReducer);

    populateHash(hash, module.moduleName, selector);
    return hash;
  }, {});
}