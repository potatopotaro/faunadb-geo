const _ = require("lodash");

const {
  calcAdditionalReadOps,
  calcMinAndMaxLevels,
  createCovering,
  optimizeWithDiffs,
  rangeOptimizeKeys,
  cellUnionToKeys,
} = require("../utils");

const OptimalRead = require("./OptimalRead");

const GeoSearch = (q) => (
  indexName,
  center,
  radius,
  {
    maxReadOps = 10,
    // TODO: Implement the options below
    // approximateSearchSpace = false,
    // allowUndesiredResults = false,
    // dropPoorPerformingCells = false,
    disableBonusReadOps = false,
    verbose = false,
  } = {}
) => {
  const approximateSearchSpace = false;
  const allowUndesiredResults = false;
  const dropPoorPerformingCells = false;
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

  const diffReadExpressions = diffRanges.map((parentRange) => {
    const children = diffOnDiffRanges.filter((childRange) =>
      childRange.find((child) =>
        parentRange.find((parent) => child.includes(parent))
      )
    );
    if (children.length)
      return {
        range: parentRange,
        expression: q.Difference(
          OptimalRead(q)(indexName, parentRange),
          ...children.map((childRange) => OptimalRead(q)(indexName, childRange))
        ),
      };
    return {
      range: parentRange,
      expression: OptimalRead(q)(indexName, parentRange),
    };
  });
  const readExpressions = sourceRanges.map((parentRange) => {
    const children = diffReadExpressions.filter(({ range: childRange }) =>
      childRange.find((child) =>
        parentRange.find((parent) => child.includes(parent))
      )
    );
    if (children.length)
      return q.Difference(
        OptimalRead(q)(indexName, parentRange),
        ...children.map((child) => child.expression)
      );
    return OptimalRead(q)(indexName, parentRange);
  });

  const readOpsUsed =
    sourceRanges.length + diffRanges.length + diffOnDiffRanges.length;

  if (readOpsUsed > maxReadOps)
    return GeoSearch(q)(indexName, center, radius, {
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

module.exports = GeoSearch;
