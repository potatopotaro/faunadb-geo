const range = require("lodash.range");

module.exports = (q) => (string, indexRange = [0, 100]) =>
  q.Take(
    q.Subtract(q.Length(string), indexRange[0] - 1),
    range(indexRange[0], indexRange[1])
  );
