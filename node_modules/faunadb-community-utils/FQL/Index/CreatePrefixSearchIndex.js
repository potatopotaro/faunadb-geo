const StringPrefixGenerator = require("../String/StringPrefixGenerator");

module.exports = (q) => ({
  fieldSelectPath,
  minPrefixLength,
  maxPrefixLength,
  source,
  terms = [],
  ...restOfCreateIndexParams
}) =>
  q.CreateIndex({
    source: {
      collection: source.collection ? source.collection : source,
      fields: Object.assign(source.fields ? source.fields : {}, {
        prefixes: q.Query(
          q.Lambda((doc) =>
            StringPrefixGenerator(q)(
              q.Select(fieldSelectPath, doc),
              minPrefixLength,
              maxPrefixLength
            )
          )
        ),
      }),
    },
    terms: [
      ...terms,
      {
        binding: "prefixes",
      },
    ],
    ...restOfCreateIndexParams,
  });
