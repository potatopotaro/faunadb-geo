const { finishUpperBoundKey, finishLowerBoundKey } = require("../utils");

const OptimalRead = (q) => (indexName, range) =>
  range.length > 1
    ? q.Range(
        q.Match(q.Index(indexName), range[0].slice(0, -1)),
        finishLowerBoundKey(range[0]),
        finishUpperBoundKey(range[range.length - 1])
      )
    : q.Match(q.Index(indexName), range[0]);

module.exports = OptimalRead;
