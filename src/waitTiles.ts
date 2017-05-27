import { PromiseObject } from './modules/types';

export function waitTiles(promisesStorage: PromiseObject) {
  const promises = Object
    .keys(promisesStorage)
    .map(key => promisesStorage[key])
    .filter(Boolean);

  return Promise.all(promises);
}