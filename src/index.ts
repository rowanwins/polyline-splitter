import { Edge } from './Edge'
import { IntersectionPoint } from './IntersectionPoint'
import { fillQueue } from './fillQueue.js'
import { findIntersectionPoints } from './findIntersections.js'
import { BBox, Feature, LineString, MultiLineString, Position } from 'geojson'

export type LineStringOrMultiLineStringFeature =  Feature<LineString | MultiLineString> | LineString | MultiLineString

export default function polylineSplitter (line1: LineStringOrMultiLineStringFeature, line2: LineStringOrMultiLineStringFeature): LineStringOrMultiLineStringFeature {
  const intersections = [] as IntersectionPoint[]
  const line1Edges = [] as Edge[]
  const line2Edges = [] as Edge[]
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
    lastEdge = e
  })
  if (lastEdge) {
    if (!lastEdge.p2.isSamePoint(portionLine[0])) {
      portionLine.push(lastEdge.p2.p)
      allPortions.push(portionLine)      
    }
  }
  portionLine = []
}

// function walkPolylineForwards(intersectionPoint, outPoly) {
//   let nextEdge = intersectionPoint.polylineEdge
//   console.log('walking polyline fowards')

//   if (nextEdge.intersectionPoints.length > 1) {
//     // _debugIntersectionPoint(intersectionPoint)
//     const lastPointOnEdge = nextEdge.intersectionPoints[nextEdge.intersectionPoints.length - 1]
//     if (!lastPointOnEdge.isSamePoint(intersectionPoint.p)) {
//       let currentIndex = findIndexOfIntersectionPoint(intersectionPoint, nextEdge.intersectionPoints)
//       let nextIp = nextEdge.intersectionPoints[currentIndex + 1]
//       outPoly.push(nextIp.p)
//       nextIp.incrementVisitCount(true)
//       return nextIp
//     }
//   }
//   let condition = true
//   while (condition) {
//     outPoly.push(nextEdge.p2.p)
//     nextEdge = nextEdge.nextEdge
//     if (nextEdge === null) return intersectionPoint
//     else if (nextEdge.intersectionPoints.length > 0) condition = false
//   }
//   if (nextEdge === undefined) return intersectionPoint
//   const lastIntersection = nextEdge.intersectionPoints[0]
//   lastIntersection.incrementVisitCount(true)
//   outPoly.push(lastIntersection.p)
//   return lastIntersection
// }

