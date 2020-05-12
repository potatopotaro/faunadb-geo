const CreatePrefixSearchIndex = require("../FQL/Index/CreatePrefixSearchIndex");

const createPrefixSearchResources = (q) => (client) => async ({
  min_prefix_length,
  max_prefix_length,
  prefix_field_locations,
}) => {
  const prefixFieldLocations = prefix_field_locations.map((s) => s.split("."));

  const prefixCollections = prefixFieldLocations.reduce(
    (collections, location) => {
      if (!collections.includes(location[0])) {
        collections.push(location[0]);
      }
      return collections;
    },
    []
  );

  // create prefix collections
  await Promise.all(
    prefixCollections.map(async (collectionName) => {
      try {
        console.log(`Attempting to create Collection: ${collectionName}...`);
        console.log(
          `Successfully created Collection: ${collectionName}`,
          await client.query(q.CreateCollection({ name: collectionName }))
        );
      } catch (err) {
        if (err.message !== "instance already exists") {
          throw err;
        }
        console.log(`Collection: ${collectionName} already exists`);
      }
    })
  );
  console.log("\n");

  // create prefix search indexes
  await Promise.all(
    prefixFieldLocations.map(async ([collectionName, ...fieldSelectPath]) => {
      const indexName = `${collectionName}_by_${fieldSelectPath.slice(
        -1
      )}`.toLowerCase();
      try {
        console.log(
          `Attempting to create prefix search Index: ${indexName}...`
        );
        console.log(
          `Successfully created prefix search Index: ${indexName}`,
          await client.query(
            CreatePrefixSearchIndex(q)({
              name: indexName,
              minPrefixLength: min_prefix_length,
              maxPrefixLength: max_prefix_length,
              source: q.Collection(collectionName),
              fieldSelectPath,
              values: [{ field: "ref" }],
            })
          )
        );
      } catch (err) {
        if (err.message !== "instance already exists") {
          throw err;
        }
        console.log(`Index: ${indexName} already exists`);
      }
    })
  );
  console.log("\n");
};

// POTENTIAL FUTURE TODO ITEMS
// create geohash collections (done)
// create prefix indexes (done)
// create single prefix search query UDFs
// create multi prefix search query UDFs
// calculate and sort by distance

module.exports = createPrefixSearchResources;
