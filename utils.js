const _ = require("lodash");
const { S2 } = require("s2-geometry");
const {
  S2LatLng,
  S2Cell,
  S2CellId,
  S2RegionCoverer,
  Utils,
} = require("nodes2ts");
const { RegionCoverer, LatLng, CellUnion, CellId } = require("@radarlabs/s2");
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

const finishLowerBoundKey = (key) => key + _.repeat("0", 32 - key.length);
const finishUpperBoundKey = (key) => key + _.repeat("3", 32 - key.length);

const cellUnionToKeys = (cellUnion) =>
  cellUnion.cellIds().map((cellId) => S2.idToKey(cellId.idString()));

const createCovering = (
  type,
  center,
  radius,
  { maxCells, minLevel, maxLevel }
) => {
  const covering =
    type === "overflow"
      ? RegionCoverer.getRadiusCovering(
          new LatLng(center.lat, center.lon),
          radius,
          {
            min: minLevel,
            max: maxLevel,
            max_cells: maxCells,
          }
        )
      : createInteriorCovering(center, radius, {
          minLevel,
          maxLevel,
          maxCells,
        });
  return covering;
};

const createInteriorCovering = (
  center,
  radius,
  { minLevel, maxLevel, maxCells }
) => {
  const regionCoverer = new S2RegionCoverer();
  if (minLevel) regionCoverer.setMinLevel(minLevel);
  if (maxLevel) regionCoverer.setMaxLevel(maxLevel);
  if (maxCells) regionCoverer.setMaxCells(maxCells);
  return new CellUnion(
    regionCoverer
      .getInteriorCoveringCells(
        Utils.calcRegionFromCenterRadius(
          S2LatLng.fromDegrees(center.lat, center.lon),
          radius / 1000
        )
      )
      // PROBABLY GONNA BREAK HERE BECAUSE OF UNSIGNED INTS
      .map((cell) => new CellId(cell.id.toString()))
  );
};

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

const OptimalRead = (q) => (indexName, range) =>
  range.length > 1
    ? q.Range(
        q.Match(q.Index(indexName), range[0].slice(0, -1)),
        finishLowerBoundKey(range[0]),
        finishUpperBoundKey(range[range.length - 1])
      )
    : q.Match(q.Index(indexName), range[0]);

const getReadExpressions = (q) => (
  indexName,
  sourceRanges,
  diffRanges,
  diffOnDiffRanges
) => {
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
  return readExpressions;
};

const optimizeWithDiffs = (
  covering,
  center,
  radius,
  { minLevel, maxLevel, maxCells }
) => {
  let level = maxLevel - 1;
  let reads = [
    {
      source: "4/0302021122201",
      diffs: [
        {
          source: "4/030202112220130",
          diffs: [
            {
              source: "4/0302021122201301",
            },
          ],
        },
      ],
    },
  ];
  let sources = covering;
  let diffs;
  while (level >= minLevel) {
    const sourceCellIds = RegionCoverer.getRadiusCovering(
      new LatLng(center.lat, center.lon),
      radius,
      {
        min: level,
        max: level,
        max_cells: maxCells,
      }
    ).cellIds();
    sourceCellIds.forEach((cellId) => {
      const parent = new CellUnion([cellId]);
      const children = parent.intersection(covering);
      const rangeOptimizedChildren = rangeOptimizeKeys(
        cellUnionToKeys(children)
      );
      if (rangeOptimizedChildren.length > 0) {
        const nonChildren = parent.difference(children);
        const rangeOptimizedNonChildren = rangeOptimizeKeys(
          cellUnionToKeys(nonChildren)
        );
        if (
          rangeOptimizedNonChildren.length > 0 &&
          rangeOptimizedNonChildren.length < rangeOptimizedChildren.length
        ) {
          diffs = diffs ? diffs.union(nonChildren) : nonChildren;
          sources = sources.difference(children);
          sources = sources.union(parent);
        } else if (nonChildren.ids().length === 0) {
          sources = sources.difference(children);
          sources = sources.union(parent);
        }
      }
    });

    const nextLevel = level - 1;
    level = RegionCoverer.getRadiusCovering(
      new LatLng(center.lat, center.lon),
      radius,
      {
        min: nextLevel,
        max: nextLevel,
      }
    )
      .cellIds()[0]
      .level();
  }

  return { sources, diffs };
};

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

module.exports = {
  cellUnionToKeys,
  createCovering,
  finishLowerBoundKey,
  finishUpperBoundKey,
  calcMinAndMaxLevels,
  OptimalRead,
  getReadExpressions,
  rangeOptimizeKeys,
  calcAdditionalReadOps,
  optimizeWithDiffs,
};
