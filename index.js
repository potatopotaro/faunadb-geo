const { CalculateDistance, GeoQuery } = require("./FQL");

module.exports = (q) => ({
  GeoQuery: GeoQuery(q),
  CalculateDistance: CalculateDistance(q),
});
