import { isArray, isString } from 'lodash';

export function ensureArray(value: string|string[]): string[] {
  return isString(value) ? [value] : value;
}

export function populateHash(hash: any, path: string[]|string, value: any): { [key:string]: any } {
  if (isString(path)) {
    return populateHash(hash, [path], value);
  }
  
  if (path.length === 1) {
    hash[path[0]] = value;
    return hash;
  }

  const property = path[0];
  if (!hash[property]) {
    hash[property] = {};
  }
  
  return populateHash(hash[property], path.slice(1), value);
}

export function iterate(modules: any[]|{ [key:string]: any}) {
  return isArray(modules)
    ? modules
    : Object.keys(modules).reduce((arr, values: any) => arr.concat(values), []);
}

function capitalize(str: string, i: number) {
  if (i === 0) {
    return str;
  }

  return str[0].toUpperCase() + str.slice(1);
}

export function createType({ type }: { type: string|string[] }): string {
  const list = ensureArray(type);
  return list.map(capitalize).join('');
}