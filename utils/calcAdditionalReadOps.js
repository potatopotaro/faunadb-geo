const calcMinAndMaxLevels = require("./calcMinAndMaxLevels");
const createCovering = require("./createCovering");
const optimizeWithDiffs = require("./optimizeWithDiffs");
const rangeOptimizeKeys = require("./rangeOptimizeKeys");
const cellUnionToKeys = require("./cellUnionToKeys");

const calcAdditionalReadOps = (
  center,
  radius,
  {
    maxReadOps,
    approximateSearchSpace,
    allowUndesiredResults,
    dropPoorPerformingCells,
  }
) => {
  const { minLevel, maxLevel } = calcMinAndMaxLevels(radius, maxReadOps);
  const covering = createCovering(
    approximateSearchSpace && !allowUndesiredResults ? "interior" : "overflow",
    center,
    approximateSearchSpace && allowUndesiredResults ? radius * 0.9 : radius,
    {
      maxCells: maxReadOps,
      maxLevel: maxLevel + 2,
    }
  );

  const { sources, diffs: originalDiffs } = optimizeWithDiffs(
    covering,
    center,
    radius,
    {
      minLevel,
      maxLevel: maxLevel + 2,
      maxReadOps: maxReadOps,
    }
  );

  const { sources: diffs, diffs: diffsOnDiffs } = originalDiffs
    ? optimizeWithDiffs(originalDiffs, center, radius, {
        minLevel,
        maxLevel: maxLevel + 2,
        maxReadOps: maxReadOps,
      })
    : { sources: null, diffs: null };

  const numSources = rangeOptimizeKeys(cellUnionToKeys(sources)).length;
  const numDiffs = diffs ? rangeOptimizeKeys(cellUnionToKeys(diffs)).length : 0;
  const numDiffsOnDiffs = diffsOnDiffs
    ? rangeOptimizeKeys(cellUnionToKeys(diffsOnDiffs)).length
    : 0;
  const additionalReadOps =
    maxReadOps -
    (numSources + numDiffs + numDiffsOnDiffs) +
    (maxReadOps > 5 ? Math.floor(maxReadOps / 4) : 0);
  return additionalReadOps;
};

module.exports = calcAdditionalReadOps;
