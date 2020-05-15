const { S2 } = require("s2-geometry");

const latLonToGeohash = (
  { lat, lon },
  type = "S2_QUADKEY",
  { level = 30 } = {}
) => {
  switch (type) {
    case "S2_QUADKEY":
      return S2.latLngToKey(lat, lon, level);
    default:
      return S2.latLngToKey(lat, lon, level);
  }
};

module.exports = latLonToGeohash;
