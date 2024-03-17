import { test, expect } from "vitest"
import load from 'load-json-file'
import write from 'write-json-file'
import path from 'path'
import glob from 'glob'
import polylineSplitter from '../src/index'

const directories = {
  in: path.join(__dirname, 'harness', 'in') + path.sep,
  out: path.join(__dirname, 'harness', 'out') + path.sep
}

const files = glob.sync(`${directories.in}/*.geojson`, {})

const fixtures = files.map(filename => {
  const parsed = path.parse(filename)
  return {
    filename: parsed.base,
    name: parsed.name,
    geojson: load.sync(filename)
  }
})

test('Check outputs', () => {
  fixtures.forEach(fixture => {
    var out = polylineSplitter(fixture.geojson.features[0], fixture.geojson.features[1])

    if (process.env.REGEN) write.sync(path.join(directories.out, fixture.filename), out)
    expect(out).toStrictEqual(load.sync(directories.out + fixture.filename))
  })
})
