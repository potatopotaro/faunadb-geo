const StringIndexRange = require("./StringIndexRange");

module.exports = (q) => (string, minPrefixLength = 1, maxPrefixLength = 100) =>
  q.Map(
    StringIndexRange(q)(string, [minPrefixLength, maxPrefixLength + 1]),
    q.Lambda((prefixLength) => q.SubString(string, 0, prefixLength))
  );
