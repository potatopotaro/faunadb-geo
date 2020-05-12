const Atan2 = (q) => (y, x) =>
  q.Let(
    { pi: 3.141592653589793 },
    q.If(
      q.GT(x, 0),
      q.Atan(q.Divide(y, x)),
      q.If(
        q.And(q.LT(x, 0), q.GTE(y, 0)),
        q.Add(q.Atan(q.Divide(y, x)), q.Var("pi")),
        q.If(
          q.And(q.LT(x, 0), q.LT(y, 0)),
          q.Subtract(q.Atan(q.Divide(y, x)), q.Var("pi")),
          q.If(
            q.And(q.Equals(x, 0), q.GT(y, 0)),
            q.Divide(q.Var("pi"), 2),
            q.If(
              q.And(q.Equals(x, 0), q.LT(y, 0)),
              q.Subtract(0, q.Divide(q.Var("pi"), 2)),
              0
            )
          )
        )
      )
    )
  );

module.exports = Atan2;
