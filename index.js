const {
  CalculateDistance,
  CreateGeoSpatialIndex,
  GeoSearch,
} = require("./FQL");

module.exports = (q) => ({
  CalculateDistance: CalculateDistance(q),
  CreateGeoSpatialIndex: CreateGeoSpatialIndex(q),
  GeoSearch: GeoSearch(q),
});
