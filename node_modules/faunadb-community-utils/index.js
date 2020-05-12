const CreateNGramSearchIndex = require("./FQL/Index/CreateNGramSearchIndex");
const NGramGenerator = require("./FQL/String/NGramGenerator");
const SelectDeep = require("./FQL/Document/SelectDeep");
const Characters = require("./FQL/String/Characters");
const StringPrefixGenerator = require("./FQL/String/StringPrefixGenerator");
const CreatePrefixSearchIndex = require("./FQL/Index/CreatePrefixSearchIndex");
const BulkCreate = require("./FQL/Document/BulkCreate");
const MultiMatch = require("./FQL/Index/MultiMatch");
const createPrefixSearchResources = require("./scripts/createPrefixSearchResources");

module.exports = (query) => {
  if (!query) throw "A faunadb.query object is required.";
  return {
    CreateNGramSearchIndex: CreateNGramSearchIndex(query),
    NGramGenerator: NGramGenerator(query),
    SelectDeep: SelectDeep(query),
    Characters: Characters(query),
    StringPrefixGenerator: StringPrefixGenerator(query),
    CreatePrefixSearchIndex: CreatePrefixSearchIndex(query),
    BulkCreate: BulkCreate(query),
    MultiMatch: MultiMatch(query),
    createPrefixSearchResources: createPrefixSearchResources(query),
  };
};
