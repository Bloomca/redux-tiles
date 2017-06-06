import { isArray, isString } from 'lodash';

export function ensureArray(value: string|string[]): string[] {
  return isString(value) ? [value] : value;
}

export function populateHash(hash: any, path: string[]|string, value: any): { [key: string]: any } {
  if (isString(path)) {
    return populateHash(hash, [path], value);
  }

  if (path.length === 1) {
    hash[path[0]] = value;
    return hash;
  }

  const property: string = path[0];
  if (!hash[property]) {
    hash[property] = {};
  }

  return populateHash(hash[property], path.slice(1), value);
}

export function iterate(tiles: any[]|{ [key: string]: any }): any[] {
  return isArray(tiles)
    ? tiles
    : Object.keys(tiles).reduce((arr: any[], key: string) => {
      const values: any = (tiles as { [key: string]: any })[key];
      return arr.concat(values);
    }, []);
}

function capitalize(str: string, i: number): string {
  if (i === 0) {
    return str;
  }

  return str[0].toUpperCase() + str.slice(1);
}

export function createType({ type, path }: { type: string|string[], path?: null|undefined|string[] }): string {
  const list: string[] = ensureArray(type).concat(path == null ? [] : path.map(String));
  return list.map(capitalize).join('');
}
