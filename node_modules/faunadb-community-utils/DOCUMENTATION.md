## NOTE

*Info pertaining to native FQL will largely be omitted for conciseness, refer to [the native FQL docs](https://docs.fauna.com/fauna/current/api/fql/cheat_sheet) for more info regarding native FQL.*

## createPrefixSearchResources

```js
createPrefixSearchResources( client )( config )
```

### Description

Idempotently creates `Collections` and `Indexes` for prefix searching. Prefix searching is particularly useful for querying geohashes.

### Parameters

#### `client`

```js
// REQUIRED
const client = new faunadb.Client({secret: "<FAUNAD_SECRET>"})
```

#### `config`

```js
// REQUIRED
{
  // OPTIONAL
  minPrefixLength: 1, // default
  // OPTIONAL
  maxPrefixLength: 100, // default
  // REQUIRED
  // very similar to Select's path arg, except a Collection name is required.
  prefix_field_locations: ["<Collection_Name>.<Field_A>...<Field_B>"]
}
```

### Returns
Doesn't return anything. However, it does `console.log` the results of all `client.query` executions, along with step-by-step progress.

---

## BulkCreate

```js
BulkCreate( CollectionRef, dataArray )
```

### Description

Loops over `dataArray` and creates `dataArray.length` documents in `CollectionRef`. Refer to the source code for more info, it's very straightforward.

### Parameters

#### `CollectionRef`

```js
// REQUIRED
q.Collection("<COLLECTION_NAME>")
```

#### `dataArray`

```js
// REQUIRED
[
  // data for document 1
  {
    any_field: "any_value"
  },
  // ...
  // data for document N
  {
    any_field: "any_value"
  }
]
```

### Returns
An object containing the metadata about the last `Create` (on `CollectionRef`) operation used under the hood.

---

## SelectDeep

```js
SelectDeep( pathsArray, DocumentRef )
```

### Description

Loops through `pathsArray`, which represents nested `Documents`, and resolves each array with `Select` and `Get`.

### Parameters

#### `pathsArray`

```js
// REQUIRED
[
  ["data", "nested_document_ref"],
  ["data", "some_field"]
]
```

#### `DocumentRef`

```js
// REQUIRED (many ways to do this)
q.Ref(q.Collection("<COLLECTION_NAME>"), "<DOCUMENT_ID>")
```

### Returns
The results of the final `Get` called.

---

## CreateNGramSearchIndex

```js
CreateNGramSearchIndex( param_object )
```

### Description

Creates an `Index` with an N-Gram binding. Inherits the same constraints that `CreateIndex` has, since it uses `CreateIndex` under the hood. An N-Gram, or at least how it's implemented in FQL (`NGram`, FYI it's undocumented; refer to the community slack and/or FaunaDB blog for more info), offers similar behavior to a substring search algorithm.

### Parameters

#### `param_object`

Is an extension of `CreateIndex`'s `param_object`. Documented below is only what is unique to `CreateNGramSearchIndex`.

```js
{
  // REQUIRED
  // identical to how the native FQL Select handles pathing
  // e.g. ["data", "some_field"]
  fieldSelectPath: ["field1", ..., "fieldN"],

  // OPTIONAL
  // must be >= 0
  minGramLength = 1
  maxGramLength = 100

  // some requirements
  ...restOfCreateIndexParams
}
```

### Returns
An object containing the metadata about the `CreateIndex` operations used under the hood.

---

## CreatePrefixSearchIndex

```js
CreatePrefixSearchIndex( param_object )
```

### Description

Creates an `Index` with `maxPrefixLength - minPrefixLength` term bindings. Inherits the same constraints that `CreateIndex` has, since it uses `CreateIndex` under the hood. Prefix search is particularly useful for querying geohashes.

### Parameters

#### `param_object`

Is an extension of `CreateIndex`'s `param_object`. Documented below is only what is unique to `CreatePrefixSearchIndex`.

```js
{
  // REQUIRED
  // identical to how the native FQL Select handles pathing
  // e.g. ["data", "some_field"]
  fieldSelectPath: ["field1", ..., "fieldN"],

  // OPTIONAL
  // must be >= 0
  minPrefixLength = 1
  maxPrefixLength = 100

  // some requirements
  ...restOfCreateIndexParams
}
```

### Returns
An object containing the metadata about the `CreateIndex` operations used under the hood.

---

## MultiMatch

```js
MultiMatch( IndexRef, searchTerms )
```

### Description

`Map`s over `searchTerms` and returns a `Union` of `searchTerms.length` `Match(Index(...), ...)` calls.

### Parameters

#### `IndexRef`

```js
// REQUIRED
q.Index("<INDEX_NAME>")
```

#### `searchTerms`

```js
// REQUIRED
[
  "Term_1",
  //...
  "Term_N"
]
```

### Returns
A `Union` of `searchTerms.length` `Match(Index(...), ...)` calls.

---

## Characters

```js
Characters( string )
```

### Description

Applies `NGram` to the provided `string`, with parameters set to produce n-grams of length 1. e.g. "Cat" returns ["C", "a", "t"].

### Parameters

#### `string`

```js
// REQUIRED
"wow I'm a string"
```

### Returns
An array of length-1 n-grams. e.g. "Cat" returns ["C", "a", "t"].

---


## NGramGenerator

```js
NGramGenerator( string, minGramLength = 1, maxGramLength = 100 )
```

### Description

Creates `string` n-grams of length `minGramLength` to `maxGramLength`. `NGram` is used under the hood of course.

### Parameters

#### `string`

```js
// REQUIRED
"wow I'm a string"
```

#### `minGramLength`

```js
// OPTIONAL
minGramLength = 1 // default
```

#### `maxGramLength`

```js
// OPTIONAL
maxGramLength = 100 // default
```

### Returns
An array of n-grams, ranging from `minGramLength` to `maxGramLength` inclusively, in size.

---

## StringIndexRange

```js
StringIndexRange( string, indexRange = [0, 100] )
```

### Description

Provides an array range of increasing integers, to mimic a string's indexes. Currently, it's impossible to do such a thing entirely in FQL, thus the array is created on the client-side in JavaScript.

### Parameters

#### `string`

```js
// REQUIRED
"wow I'm a string"
```

#### `indexRange`

```js
// OPTIONAL
indexRange = [0, 100] // default
```

### Returns
Returns an array of increasing integers (increasing by 1) from `indexRange[0]` to `string.length` (or `indexRange[1]`, whichever is greater).

---

## StringPrefixGenerator

```js
StringPrefixGenerator( string, minPrefixLength = 1, maxPrefixLength = 100 )
```

### Description

Creates `string` prefixes of length `minPrefixLength` to `maxPrefixLength`. A prefix is essentially a substring that has to start from the beginning of a string.

### Parameters

#### `string`

```js
// REQUIRED
"wow I'm a string"
```

#### `minPrefixLength`

```js
// OPTIONAL
minPrefixLength = 1 // default
```

#### `maxPrefixLength`

```js
// OPTIONAL
maxPrefixLength = 100 // default
```

### Returns
An array of prefixes, ranging from `minPrefixLength` to `maxPrefixLength` inclusively, in size.