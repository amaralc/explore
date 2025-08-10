export const objFromArray = (arr: any[], key = 'id'): Record<string, any> =>
  arr.reduce((accumulator, current) => {
    accumulator[current[key]] = current;
    return accumulator;
  }, {});
