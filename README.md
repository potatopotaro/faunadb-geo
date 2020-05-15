<h1 align="center">Welcome to faunadb-geo 👋</h1>
<p>
  <a href="https://www.npmjs.com/package/faunadb-geo" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/faunadb-geo.svg">
  </a>
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
  <a href="https://twitter.com/potato_potaro" target="_blank">
    <img alt="Twitter: potato_potaro" src="https://img.shields.io/twitter/follow/potato_potaro.svg?style=social" />
  </a>
</p>

> A library for querying S2/geospatial resources in FaunaDB.

# Getting Started

## Install

```sh
npm install --save faunadb-geo
```

or

```sh
yarn add faunadb-geo
```

# How to Use

Please note, this library is only capable of performing geosearches _around_ a set of coordinates, i.e. geosearch on a circle constructed by the given coordinates and radius. Capabilities for more advanced shapes and spaces can be added down the road, given enough prioritization and demand. Please open/find a relevant github issue if you need such a feature :)

## Prerequisite Checklist

- [ ] You have Geohashes stored in FaunaDB.
- [ ] You've created a GeoSpatial Index on a Collection with Geohashes.

## Storing Geohashes in FaunaDB

This library provides a function for you to convert a pair of coordinates, i.e. latitude and longitude, to a geohash (an S2 Quadkey in particular, as that is all we support currently).

```js
const { Client, query: q } = require("faunadb");
const { latLonToGeohash } = require("faunadb-geo")(q);

const coordinates = { lat: 30.274665, lon: -97.74035 };

// store this geohash wherever you wish on a Document
const geohash = latLonToGeohash(coordinates);
```

## Creating a GeoSpatial Index

```js
const { Client, query: q } = require("faunadb");
const { CreateGeoSpatialIndex } = require("faunadb-geo")(q);

const client = new Client({
  secret: "<FAUNADB_SECRET>",
});

const geohashParams = {
  // provide the path to your geohash here
  SelectPath: ["data", "location", "geohash"], // example
};

const regularIndexParams = {
  // your typical FaunaDB index params can be inserted here, examples:
  name: "items_by_geohash",
  source: q.Collection("items"),
  values: [
    // NOTE: The Index will always return the geohash as the first value,
    // even if you don't specify it; this is for optimizations using Range
    { field: ["ref"] },
    // NOTE: in order to use CalculateDistance and other FQL helpers,
    // you'll need to return coordinates in your Index's values, like so:
    { field: ["data", "location", "coordinates", "lat"] }, // example
    { field: ["data", "location", "coordinates", "lon"] }, // example
  ],
};

client.query(CreateGeoSpatialIndex(geohashParams, regularIndexParams));
```

## A Minimal GeoSearch

```js
const { Client, query: q } = require("faunadb")
const { GeoSearch } = require("faunadb-geo")(q)

const client = new Client({
  secret: "<FAUNADB_SECRET>"
})

// under the hood, GeoSearch returns a Union of
// one or more Match, Range, and Difference calls.

// from here you can Filter, Map + Get, etc.
// as you typically would when reading an Index
client.query(q.Paginate(GeoSearch(
  "items_by_geohash", // example index name
  { lat: 30.274665, lon: -97.74035 }, // example coordinates
  1000, // example radius, in meters
))
```

## Undesired Results

Currently, GeoSearch only provides an "overflow" covering of your search radius. This guarantees that all of the desired Documents can be retrieved, but some Documents outside of your search radius might also be returned. If you don't mind receiving some undesired results, then you can ignore this part, otherwise you have three options:

### 1. Filter by Distance

This requires you to retrieve a Document's latitude and longitude at some point. Either with a Get call _or_ by returning them in the Index's values field. Here's an example which expects the latter, the more optimal method. Keep in mind this could significantly affect performance if you use too few read ops (see Option 2 below).

```js
const { Client, query: q } = require("faunadb");
const { CalculateDistance } = require("faunadb-geo")(q);

const origin = { lat: 30.274665, lon: -97.74035 }; // example
const searchRadius = 1000; // meters

client.query(
  q.Filter(
    q.Map(
      q.Paginate(
        GeoSearch(...)
      ),
      q.Lambda((geohash, ref, lat, lon) => [
        ref,
        CalculateDistance({ lat, lon }, origin),
      ])
    ),
    q.Lambda((ref, distance) => q.LTE(distance, searchRadius))
  )
);
```

### 2. Use More Read Ops

"Read ops" are how FaunaDB calculates costs per read. The more read ops you use, the less overflow your search results will have, which in turn makes your search more precise. In other words:

**more** read ops = **less** overflow

**less** read ops = **more** overflow

There's a fine balance between the two and it depends on the volume of data you're dealing with and your tolerance for undesired results.

To adjust the number of read ops you use, set the `maxReadOps` field in the `GeoSearch` `options` parameter. By default, `maxReadOps` is set to 10.

Regarding filtering performance, here's an extension of the equations from above (only applicable if you choose to filter of course):

**more** read ops = **less** overflow = **less** filtering = **better** performance

**less** read ops = **more** overflow = **more** filtering = **worse** performance

### 3. Reduce Search Radius

By reducing the search radius, your search will result in less overflow _but_ there will also be gaps in your search "circle". If you can afford it, this can be a healthy tradeoff to reduce the number of undesired results and/or boost filter performance. I suggest reducing the search radius by 5~10%.

# API Glossary

[CalculateDistance](DOCUMENTATION.md#CalculateDistance)

[CreateGeoSpatialIndex](DOCUMENTATION.md#CreateGeoSpatialIndex)

[GeoSearch](DOCUMENTATION.md#GeoSearch)

[latLonToGeohash](DOCUMENTATION.md#latLonToGeohash)

---

## Joining the FaunaDB Community

If you haven't already, I highly suggest joining the official FaunaDB Community Slack.

Slack: https://community-invite.fauna.com

## Author

👤 **Taro Woollett-Chiba**

- Twitter: [@potato_potaro](https://twitter.com/potato_potaro)
- Github: [@potatopotaro](https://github.com/potatopotaro)
- LinkedIn: [@taro-woollett-chiba-25a802125](https://linkedin.com/in/taro-woollett-chiba-25a802125)

## Show your support

Give a ⭐️ if this project helped you!
