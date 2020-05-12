const { RegionCoverer, LatLng, CellUnion } = require("@radarlabs/s2");
const rangeOptimizeKeys = require("./rangeOptimizeKeys");
const cellUnionToKeys = require("./cellUnionToKeys");

const optimizeWithDiffs = (
  covering,
  center,
  radius,
  { minLevel, maxLevel, maxCells }
) => {
  let level = maxLevel - 1;
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

module.exports = optimizeWithDiffs;
