export function isArray(arrayToCheck: any): boolean {
  return Array.isArray(arrayToCheck);
}

export function isString(stringToCheck: any): boolean {
  return typeof stringToCheck === "string";
}

export function isFunction(functionToCheck: any): boolean {
  return typeof functionToCheck === "function";
}

export function get(object: any, path: string[]): any {
  return path.reduce((res: any, key: string) => {
    if (!res) {
      return undefined;
    }

    return res[key];
  }, object);
}

export function mapValues(object: any, cb: any): any {
  return Object.keys(object).reduce((hash: any, key: string) => {
    const value: any = object[key];
    hash[key] = cb(value);
    return hash;
  }, {});
}
