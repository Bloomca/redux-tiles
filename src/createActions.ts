import { isArray } from 'lodash';
import { iterate, populateHash } from './helpers';
import { IPromiseObject, ITile } from './tiles/types';

export function createActions(tiles: ITile[]): any {
  // this storage will keep all promises
  // so if the request is already in progress,
  // we could still await it
  return iterate(tiles).reduce((hash: any, tile: ITile) => {
    populateHash(hash, tile.tileName, tile.action);

    return hash;
  }, {});
}
