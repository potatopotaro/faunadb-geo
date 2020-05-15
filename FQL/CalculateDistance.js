const Atan2 = require("./Atan2");

// Shout out to Brecht at FaunaDB for both CalculateDistance and Atan2.
// Thank you good sir.

const CalculateDistance = (q) => (to, from) =>
  q.Let(
    {
      radiusEarthKm: 6371,
      pi: 3.141592653589793,
      piQuot: q.Divide(q.Var("pi"), 180),
      toLat: q.Select(["lat"], to),
      toLon: q.Select(["lon"], to),
      fromLat: q.Select(["lat"], from),
      fromLon: q.Select(["lon"], from),
      distLat: q.Subtract(
        q.Multiply(q.Var("toLat"), q.Var("piQuot")),
        q.Multiply(q.Var("fromLat"), q.Var("piQuot"))
      ),
      distLon: q.Subtract(
        q.Multiply(q.Var("toLon"), q.Var("piQuot")),
        q.Multiply(q.Var("fromLon"), q.Var("piQuot"))
      ),
      a: q.Add(
        q.Multiply(
          q.Sin(q.Divide(q.Var("distLat"), 2)),
          q.Sin(q.Divide(q.Var("distLat"), 2))
        ),
        q.Multiply(
          q.Multiply(
            q.Cos(q.Multiply(q.Var("toLat"), q.Var("piQuot"))),
            q.Cos(q.Multiply(q.Var("fromLat"), q.Var("piQuot")))
          ),
          q.Multiply(
            q.Sin(q.Divide(q.Var("distLon"), 2)),
            q.Sin(q.Divide(q.Var("distLon"), 2))
          )
        )
      ),
      c: q.If(
        q.Equals(q.Var("a"), 0),
        q.Multiply(2, Atan2(q)(0, 1)),
        q.Multiply(
          2,
          Atan2(q)(q.Sqrt(q.Var("a")), q.Sqrt(q.Subtract(1, q.Var("a"))))
        )
      ),
      d: q.Multiply(q.Var("radiusEarthKm"), q.Var("c")),
      metersDistance: q.Multiply(q.Var("d"), 1000),
    },
    q.Var("metersDistance")
  );

module.exports = CalculateDistance;
