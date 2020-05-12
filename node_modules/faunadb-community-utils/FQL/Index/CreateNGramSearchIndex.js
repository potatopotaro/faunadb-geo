const NGramGenerator = require("../String/NGramGenerator");
const SelectDeep = require("../Document/SelectDeep");

module.exports = (q) => ({
  fieldSelectPath,
  minGramLength,
  maxGramLength,
  source,
  terms = [],
  ...restOfCreateIndexParams
}) =>
  q.CreateIndex({
    source: {
      collection: source.collection ? source.collection : source,
      fields: Object.assign(source.fields ? source.fields : {}, {
        n_grams: q.Query(
          q.Lambda((doc) =>
            NGramGenerator(q)(
              q.Select(fieldSelectPath, doc),
              minGramLength,
              maxGramLength
            )
          )
        ),
      }),
    },
    terms: [
      ...terms,
      {
        binding: "n_grams",
      },
    ],
    ...restOfCreateIndexParams,
  });
