## NOTE

_Info pertaining to native FQL will largely be omitted for conciseness, refer to [the native FQL docs](https://docs.fauna.com/fauna/current/api/fql/cheat_sheet) for more info regarding native FQL._

## CalculateDistance

```js
CalculateDistance(to, from);
```

### Description

Given two objects `to` and `from`, which both contain `lat` and `lon` fields, approximates the distance in meters between `to` and `from`. Note that while this distance calculation isn't perfect, it's stil quite accurate.

### Parameters

#### `to` and `from`

```js
// REQUIRED
{
  // REQUIRED
  lat: 6.859673258469451, // latitude
  // REQUIRED
  lon: 52.0573310026579 // longitude
}
```

### Returns

A float representing an approximation of the meters between `to` and `from`.

---

## CreateGeoSpatialIndex

```js
CreateGeoSpatialIndex(geohashParams, indexParams);
```

### Description

Very similar in usage to the native FQL function `CreateIndex`, with the only major difference being `geohashParams` which describes your geohash field.

### Parameters

#### `geohashParams`

```js
// REQUIRED
{
  // REQUIRED
  // this will eventually be passed into a Select call as the first arg,
  // as implied by the field's name "SelectPath"
  SelectPath: ["data", "location", "geohash"], // example

  // OPTIONAL
  minLength: 3 // default, meant for S2 Quadkeys

  // OPTIONAL
  maxLength: 32 // default, meant for S2 Quadkeys
}
```

#### `indexParams`

```js
// REQUIRED
{

  // OPTIONAL
  values: [
    // the geohash will always be returned as the first value,
    // whether it was specified or not
    { field: geohashParams.SelectPath } // default
  ],

  // SOME REQUIRED (inherited from CreateIndex)
  ...restOfCreateIndexParams
}
```

### Returns

An object containing the metadata about the `CreateIndex` operations used under the hood.

---

## GeoSearch

```js
GeoSearch(indexName, center, radius, options);
```

### Description

When pointed to an index for prefix searching on geohashes, provides an FQL expression for you to execute. The FQL expression, when executed, will return a `SetRef` roughly representing the indexed documents found within `radius` meters of the `center` coordinates (i.e. roughly searches for indexed documents within a search circle).

### Parameters

#### `indexName`

```js
// REQUIRED
"<NAME_OF_PREFIX_SEARCHABLE_INDEX>";
```

#### `center`

```js
// REQUIRED
{
  // REQUIRED
  lat: 6.859673258469451, // latitude
  // REQUIRED
  lon: 52.0573310026579 // longitude
}
```

#### `radius`

```js
// REQUIRED
1000; // a positive number of meters
```

#### `options`

```js
// OPTIONAL
{
  // OPTIONAL
  // maximum number of FaunaDB read ops allowed for this FQL expression
  maxReadOps: 10, // default

  // OPTIONAL
  // this library saves read ops when it can
  // through various optimizations;
  // when set to true, any saved read ops will be NOT be respent
  // to make the GeoSearch higher resolution
  disableBonusReadOps: false, // default

  // OPTIONAL
  // when true, returns an object containing additonal information
  // rather than just the FQL expression
  verbose: false, // default
}
```

### Returns

A float representing an approximation of meters between `to` and `from`.

---

## latLonToGeohash

```js
latLonToGeohash(coordinates);
```

### Description

Given a set of coordinates, will generate an S2 Quadkey, which we refer to as a "geohash" throughout this library. In the future, more geohash types (e.g. H3) will likely be supported.

### Parameters

#### `coordinates`

```js
// REQUIRED
{
  // REQUIRED
  lat: 6.859673258469451, // latitude
  // REQUIRED
  lon: 52.0573310026579 // longitude
}
```

### Returns

An S2 Quadkey. For more info, please refer to [the docs](https://www.npmjs.com/package/s2-geometry#simple-examples) for the `s2-geometry` npm package.

---
