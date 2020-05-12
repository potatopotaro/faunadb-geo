module.exports = (q) => (CollectionRef, dataArray) =>
  q.Do(
    q.Map(
      dataArray,
      q.Lambda((data) =>
        q.Create(CollectionRef, {
          data,
        })
      )
    )
  );
