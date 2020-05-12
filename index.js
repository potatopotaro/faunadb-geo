const _ = require("lodash");

const {
  calcAdditionalReadOps,
  calcMinAndMaxLevels,
  createCovering,
  optimizeWithDiffs,
  rangeOptimizeKeys,
  cellUnionToKeys,
  getReadExpressions,
} = require("./utils");

/* 

1. geohash section should be about EXPLAINING NESTING BEHAVIOR
2. link pointers for more info

3. include hash in values for range
4. discuss range briefly

*/

const GeoQuery = (q) => (
  indexName,
  center,
  radius,
  {
    maxReadOps = 10,
    approximateSearchSpace,
    allowUndesiredResults,
    dropPoorPerformingCells,
    disableBonusReadOps,
    verbose,
  } = {}
) => {
  const additionalReadOps = disableBonusReadOps
    ? 0
    : calcAdditionalReadOps(center, radius, {
        maxReadOps,
        approximateSearchSpace,
        allowUndesiredResults,
        dropPoorPerformingCells,
      });
  const { minLevel, maxLevel } = calcMinAndMaxLevels(
    radius,
    maxReadOps + additionalReadOps
  );
  const covering = createCovering(
    approximateSearchSpace && !allowUndesiredResults ? "interior" : "overflow",
    center,
    approximateSearchSpace && allowUndesiredResults ? radius * 0.9 : radius,
    {
      maxCells: maxReadOps + additionalReadOps,
      maxLevel: maxLevel + _.round(maxReadOps / 40),
    }
  );

  const { sources, diffs: originalDiffs } = optimizeWithDiffs(
    covering,
    center,
    radius,
    {
      minLevel,
      maxLevel: maxLevel + 1,
      maxReadOps: maxReadOps + additionalReadOps,
    }
  );

  const { sources: diffs, diffs: diffsOnDiffs } = originalDiffs
    ? optimizeWithDiffs(originalDiffs, center, radius, {
        minLevel,
        maxLevel: maxLevel + 2,
        maxReadOps: maxReadOps + additionalReadOps,
      })
    : { sources: null, diffs: null };

  const sourceRanges = rangeOptimizeKeys(cellUnionToKeys(sources));
  const diffRanges = diffs ? rangeOptimizeKeys(cellUnionToKeys(diffs)) : [];
  const diffOnDiffRanges = diffsOnDiffs
    ? rangeOptimizeKeys(cellUnionToKeys(diffsOnDiffs))
    : [];
  const readExpressions = getReadExpressions(q)(
    indexName,
    sourceRanges,
    diffRanges,
    diffOnDiffRanges
  );

  const readOpsUsed =
    sourceRanges.length + diffRanges.length + diffOnDiffRanges.length;

  if (readOpsUsed > maxReadOps)
    return GeoQuery(q)(indexName, center, radius, {
      maxReadOps,
      approximateSearchSpace,
      allowUndesiredResults,
      dropPoorPerformingCells,
      disableBonusReadOps: true,
    });
  if (verbose)
    return {
      fql: q.Union(...readExpressions),
      sourceRanges,
      diffRanges,
      diffOnDiffRanges,
    };
  return q.Union(...readExpressions);
};

module.exports = GeoQuery;
