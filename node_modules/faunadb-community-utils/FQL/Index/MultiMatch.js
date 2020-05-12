module.exports = (q) => (IndexRef, searchTerms) =>
  q.Union(
    q.Map(
      searchTerms,
      q.Lambda((term) => q.Match(IndexRef, term))
    )
  );
