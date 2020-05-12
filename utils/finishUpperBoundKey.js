const _ = require("lodash");

const finishUpperBoundKey = (key) => key + _.repeat("3", 32 - key.length);

module.exports = finishUpperBoundKey;
