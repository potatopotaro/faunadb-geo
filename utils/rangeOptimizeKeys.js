const _ = require("lodash");

const rangeOptimizeKeys = (keys) =>
  _.chain(keys)
    .sortBy()
    .reduce((rangeOptimized, key, i, originalKeys) => {
      if (i === 0) return [[key]];
      const parent = key.slice(0, -1);
      const childNum = parseInt(key.slice(-1));
      if (childNum === 0) rangeOptimized.push([key]);
      else {
        const prevKey = originalKeys[i - 1];
        if (`${parent}${childNum - 1}` === prevKey)
          rangeOptimized[rangeOptimized.length - 1] = [
            ..._.last(rangeOptimized),
            key,
          ];
        else {
          rangeOptimized.push([key]);
        }
      }
      return rangeOptimized;
    }, [])
    .value();

module.exports = rangeOptimizeKeys;
