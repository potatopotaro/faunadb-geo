const _ = require("lodash");
const { CreatePrefixSearchIndex } = require("faunadb-community-utils");

const CreateGeoSpatialIndex = (q) => (
  { SelectPath, minLength = 3, maxLength = 32 },
  index_params
) => {
  if (!SelectPath) throw "Please provide a SelectPath in geohash_params.";

  return CreatePrefixSearchIndex(q)({
    fieldSelectPath: SelectPath,
    minPrefixLength: minLength,
    maxPrefixLength: maxLength,
    ...index_params,
    values: [
      { field: SelectPath },
      ..._.filter(
        _.get(index_params, "values", []),
        (v) => _.get(v, "field") !== SelectPath
      ),
    ],
  });
};

module.exports = CreateGeoSpatialIndex;
