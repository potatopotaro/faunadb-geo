const _ = require("lodash");

const finishLowerBoundKey = (key) => key + _.repeat("0", 32 - key.length);

module.exports = finishLowerBoundKey;
