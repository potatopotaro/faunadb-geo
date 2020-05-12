const Atan2 = require("./Atan2");

const CalculateDistance = (q) => (toEntity, fromEntity) =>
  q.Let(
    {
      radiusEarthKm: 6371,
      pi: 3.141592653589793,
      piQuot: q.Divide(q.Var("pi"), 180),
      toEntityLat: q.Select(["lat"], toEntity),
      toEntityLon: q.Select(["lon"], toEntity),
      fromEntityLat: q.Select(["lat"], fromEntity),
      fromEntityLon: q.Select(["lon"], fromEntity),
      distLat: q.Subtract(
        q.Multiply(q.Var("toEntityLat"), q.Var("piQuot")),
        q.Multiply(q.Var("fromEntityLat"), q.Var("piQuot"))
      ),
      distLon: q.Subtract(
        q.Multiply(q.Var("toEntityLon"), q.Var("piQuot")),
        q.Multiply(q.Var("fromEntityLon"), q.Var("piQuot"))
      ),
      a: q.Add(
        q.Multiply(
          q.Sin(q.Divide(q.Var("distLat"), 2)),
          q.Sin(q.Divide(q.Var("distLat"), 2))
        ),
        q.Multiply(
          q.Multiply(
            q.Cos(q.Multiply(q.Var("toEntityLat"), q.Var("piQuot"))),
            q.Cos(q.Multiply(q.Var("fromEntityLat"), q.Var("piQuot")))
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
