export function arrayToObjectByKey(array: any[], key: string): { [key: string]: any } {
  const rv = {};
  array.forEach(item => {
    rv[item[key]] = item;
  });
  return rv;
}
