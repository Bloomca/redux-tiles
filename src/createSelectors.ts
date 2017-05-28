import { iterate, populateHash } from './helpers';
import { Tile } from './modules/types';

export function createSelectors(modules: Tile[]|{ [key:string]: Tile }) {
  return iterate(modules).reduce((hash, module: Tile) => {
    const selector: any = module.selectors.get;
    selector.getAll = module.selectors.getAll;

    populateHash(hash, module.moduleName, selector);
    return hash;
  }, {});
}