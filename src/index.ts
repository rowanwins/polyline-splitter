import { Edge } from './Edge'
import { IntersectionPoint } from './IntersectionPoint'
import { fillQueue } from './fillQueue.js'
import { findIntersectionPoints } from './findIntersections.js'
import { BBox, Feature, LineString, MultiLineString, Position } from 'geojson'

export type LineStringOrMultiLineStringFeature =  Feature<LineString | MultiLineString> | LineString | MultiLineString

export default function polylineSplitter (line1: LineStringOrMultiLineStringFeature, line2: LineStringOrMultiLineStringFeature): LineStringOrMultiLineStringFeature {
  const intersections: IntersectionPoint[] = []
  const line1Edges: Edge[] = [] 
  const line2Edges: Edge[] = []
  const line1Bbox = [Infinity, Infinity, -Infinity, -Infinity] as BBox
  fillQueue(line1, line2, line1Edges, line2Edges, line1Bbox)
  findIntersectionPoints(line1Edges, line2Edges, intersections)

  if (intersections.length === 0) {
    return line1
  }

  const outLine = [] as Position[][]
  processLineSegments(line1Edges, outLine)
  processLineSegments(line2Edges, outLine)

  return {
    type: 'MultiLineString',
    coordinates: outLine
  }
}

function processLineSegments (lineEdges: Edge[], allPortions: Position[][]) {
  let portionLine = [] as Position[]
  let lastEdge = null as null | Edge
  lineEdges.forEach(e => {
    if (e.intersectionPoints.length === 1) {
      portionLine.push(e.p1.p)
      portionLine.push(e.intersectionPoints[0].p)
      allPortions.push(portionLine)
      portionLine = []
      portionLine.push(e.intersectionPoints[0].p)
    } else if (e.intersectionPoints.length === 0) {
      portionLine.push(e.p1.p)
    } else if (e.intersectionPoints.length > 1) {
      let condition = true
      let ipIndex = 0
      let numberIntersections = e.intersectionPoints.length
      while (condition) {
        const ip = e.intersectionPoints[ipIndex]
        if (ipIndex === 0) portionLine.push(e.p1.p)
        if (!ip.isSamePoint(portionLine[0])) {
          portionLine.push(ip.p)
          allPortions.push(portionLine)
        }
        portionLine = []
        portionLine.push(ip.p)
        ipIndex++
        if (ipIndex === numberIntersections) {
          condition = false
        }
      }
    }

    if (e.nextEdge === null) {
      if (!e.p2.isSamePoint(portionLine[0])) {
        portionLine.push(e.p2.p)
      }
      if (portionLine.length > 1) {
        allPortions.push(portionLine)
      }
      portionLine = []
      lastEdge = null
    } else {
      lastEdge = e
    }
  })

  tidyEndOfLine(lastEdge, portionLine, allPortions)
  portionLine = []
}

function tidyEndOfLine (lastEdge: Edge | null, portionLine: Position[], allPortions: Position[][]) {
  if (lastEdge) {
    if (!lastEdge.p2.isSamePoint(portionLine[0])) {
      portionLine.push(lastEdge.p2.p)
      allPortions.push(portionLine)
    }
  }
}
