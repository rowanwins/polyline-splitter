## polyline-splitter
A small (<10kb minified) javascript library for splitting geojson polylines by other polylines.

### Install
````
npm install polyline-splitter
````

### API
Accepts either a geojson `Feature<LineString | MultiLineString>` or ` LineString | MultiLineString`.

```js
import polylineSplitter from 'polyline-splitter'
// or
const polylineSplitter = require('polyline-splitter')

const line1 = {
    "type": "LineString",
    "coordinates": [[0, 0],[10, 0]]
}

const line2 = {
    "type": "LineString",
    "coordinates": [[5, -10],[5, 10]]
}
const output = polylineSplitter(polygon, polyline)
```