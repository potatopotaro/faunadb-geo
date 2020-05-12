module.exports = (q) => (pathsArray, DocumentRef) =>
  q.Reduce(
    q.Lambda((acc, path) => q.Select(path, q.Get(acc))),
    DocumentRef,
    pathsArray
  );
