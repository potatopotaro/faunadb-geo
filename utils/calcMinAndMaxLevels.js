const _ = require("lodash");
const levelAreas = require("./approxAreaOfLevels");

const calcMinAndMaxLevels = (radius, maxReadOps) => {
  const searchArea = Math.PI * Math.pow(radius, 2);
  const avgCellArea = searchArea / maxReadOps;
  return {
    minLevel: _.minBy(levelAreas, (cell) =>
      searchArea - cell.area >= 0 ? searchArea - cell.area : searchArea
    ).level,
    maxLevel: _.minBy(levelAreas, (cell) =>
      avgCellArea - cell.area >= 0 ? avgCellArea - cell.area : avgCellArea
    ).level,
  };
};

module.exports = calcMinAndMaxLevels;
