const { S2LatLng, S2RegionCoverer, Utils } = require("nodes2ts");
const { RegionCoverer, LatLng, CellUnion, CellId } = require("@radarlabs/s2");

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

module.exports = createCovering;
