const Atan2 = (q) => (y, x) =>
  q.Let(
    { pi: 3.141592653589793 },
    q.If(
      q.GT(q.Var("x"), 0),
      q.Atan(q.Divide(q.Var("y"), q.Var("x"))),
      q.If(
        q.And(q.LT(q.Var("x"), 0), q.GTE(q.Var("y"), 0)),
        q.Add(q.Atan(q.Divide(q.Var("y"), q.Var("x"))), q.Var("pi")),
        q.If(
          q.And(q.LT(q.Var("x"), 0), q.LT(q.Var("y"), 0)),
          q.Subtract(q.Atan(q.Divide(q.Var("y"), q.Var("x"))), q.Var("pi")),
          q.If(
            q.And(q.Equals(q.Var("x"), 0), q.GT(q.Var("y"), 0)),
            q.Divide(q.Var("pi"), 2),
            q.If(
              q.And(q.Equals(q.Var("x"), 0), q.LT(q.Var("y"), 0)),
              q.Subtract(0, q.Divide(q.Var("pi"), 2)),
              0
            )
          )
        )
      )
    )
  );

module.exports = Atan2;
