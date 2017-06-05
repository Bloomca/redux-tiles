import { iterate, populateHash } from './helpers';
import { ITile } from './tiles/types';

export function createSelectors(tiles: ITile[]|{ [key: string]: ITile }): any {
  return iterate(tiles).reduce((hash: any, tile: ITile) => {
    const selector: any = tile.selectors.get;
    selector.getAll = tile.selectors.getAll;
    populateHash(hash, tile.tileName, selector);

    return hash;
  }, {});
}
