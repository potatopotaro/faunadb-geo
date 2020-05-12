module.exports = (q) => (string, minGramLength = 1, maxGramLength = 100) =>
  q.Let(
    {
      gram_lengths: q.Filter(
        q.Map(
          Array.from({ length: maxGramLength }, (v, k) => k),
          q.Lambda("i", q.Subtract(q.Length(string), q.Var("i")))
        ),
        q.Lambda((gram_length) => q.GTE(gram_length, minGramLength))
      ),
      n_grams: q.Map(
        q.Var("gram_lengths"),
        q.Lambda("l", q.NGram(q.LowerCase(string), q.Var("l"), q.Var("l")))
      ),
    },
    q.Var("n_grams")
  );
