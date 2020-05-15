const _ = require("lodash");

const CreateGeoSpatialIndex = (q) => (
  { SelectPath, minLength = 3, maxLength = 32 },
  index_params
) => {
  if (!SelectPath) throw "Please provide a SelectPath in geohash_params.";

  const { CreatePrefixSearchIndex } = require("faunadb-community-utils")(q);

  return CreatePrefixSearchIndex({
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
