const {
  CalculateDistance,
  CreateGeoSpatialIndex,
  GeoSearch,
} = require("./FQL");
const { latLonToGeohash } = require("./utils");

// TODO: Figure out a better export, so non FQL code can be imported
// without a reference to `q` (query)
module.exports = (q) => ({
  CalculateDistance: CalculateDistance(q),
  CreateGeoSpatialIndex: CreateGeoSpatialIndex(q),
  GeoSearch: GeoSearch(q),
  latLonToGeohash,
});
