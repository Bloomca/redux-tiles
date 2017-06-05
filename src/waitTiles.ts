import { IPromiseObject } from './tiles/types';

export function waitTiles(promisesStorage: IPromiseObject): Promise<any> {
  const promises: (Promise<any>|undefined)[] = Object
    .keys(promisesStorage)
    .map((key: string) => promisesStorage[key])
    .filter(Boolean);

  return Promise.all(promises);
}
