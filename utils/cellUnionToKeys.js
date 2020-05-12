const { S2 } = require("s2-geometry");

const cellUnionToKeys = (cellUnion) =>
  cellUnion.cellIds().map((cellId) => S2.idToKey(cellId.idString()));

module.exports = cellUnionToKeys;
