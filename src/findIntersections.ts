import { Position } from 'geojson'
import { Edge } from './Edge'
import {IntersectionPoint} from './IntersectionPoint'

export function findIntersectionPoints(line1Edges: Edge[], line2Edges: Edge[], intersections: IntersectionPoint[]) {
  let i, ii, iii
  let line1EdgeCount = line1Edges.length
  let line2EdgeCount = line2Edges.length
  for (i = 0; i < line1EdgeCount; i++) {
    let line1Edge = line1Edges[i]

    for (ii = 0; ii < line2EdgeCount; ii++) {
      const line2Edge = line2Edges[ii]
      if (!line2Edge.intersectsLine1Bbox) continue

      if (line2Edge.maxX < line1Edge.minX || line2Edge.minX > line1Edge.maxX) continue
      if (line2Edge.maxY < line1Edge.minY || line2Edge.minY > line1Edge.maxY) continue
      const intersection = getEdgeIntersection(line1Edge, line2Edge, true)
      if (intersection !== null) {
        for (iii = 0; iii < intersection.length; iii++) {
          const ip = new IntersectionPoint(intersection[iii], line1Edge, line2Edge)
          intersections.push(ip)
        }
      }
    }
  }
  line1Edges.forEach(function (edge) {
    edge.intersectionPoints.sort(function (a, b) {
      return a.distanceFromLine1EdgeStart - b.distanceFromLine1EdgeStart
    })
  })

  line2Edges.forEach(function (edge) {
    edge.intersectionPoints.sort(function (a, b) {
      return a.distanceFromLine2EdgeStart - b.distanceFromLine2EdgeStart
    })
  })
}

const EPSILON = 1e-9

function crossProduct(a: Position, b: Position) {
  return (a[0] * b[1]) - (a[1] * b[0])
}

function dotProduct(a: Position, b: Position) {
  return (a[0] * b[0]) + (a[1] * b[1])
}

function toPoint(p: Position, s: number, d: Position): Position {
  return [
    p[0] + s * d[0],
    p[1] + s * d[1]
  ]
}

function getEdgeIntersection(lineEdge: Edge, potentialEdge: Edge, noEndpointTouch: boolean): Position[] | null {
  const va = [lineEdge.p2.p[0] - lineEdge.p1.p[0], lineEdge.p2.p[1] - lineEdge.p1.p[1]]
  const vb = [potentialEdge.p2.p[0] - potentialEdge.p1.p[0], potentialEdge.p2.p[1] - potentialEdge.p1.p[1]]

  const e = [potentialEdge.p1.p[0] - lineEdge.p1.p[0], potentialEdge.p1.p[1] - lineEdge.p1.p[1]]
  let kross = crossProduct(va, vb)
  let sqrKross = kross * kross
  const sqrLenA  = dotProduct(va, va)

  if (sqrKross > 0) {

    const s = crossProduct(e, vb) / kross
    if (s < 0 || s > 1) return null
    const t = crossProduct(e, va) / kross
    if (t < 0 || t > 1) return null
    if (s === 0 || s === 1) {
      // on an endpoint of line segment a
      return noEndpointTouch ? null : [toPoint(lineEdge.p1.p, s, va)]
    }
    if (t === 0 || t === 1) {
      // on an endpoint of line segment b
      return noEndpointTouch ? null : [toPoint(potentialEdge.p1.p, t, vb)]
    }
    return [toPoint(lineEdge.p1.p, s, va)]
  }

  const sqrLenE = dotProduct(e, e)
  kross = crossProduct(e, va)
  sqrKross = kross * kross

  if (sqrKross > EPSILON * sqrLenA * sqrLenE) return null

  const sa = dotProduct(va, e) / sqrLenA
  const sb = sa + dotProduct(va, vb) / sqrLenA
  const smin = Math.min(sa, sb)
  const smax = Math.max(sa, sb)

  if (smin <= 1 && smax >= 0) {

    if (smin === 1) return noEndpointTouch ? null : [toPoint(lineEdge.p1.p, smin > 0 ? smin : 0, va)]

    if (smax === 0) return noEndpointTouch ? null : [toPoint(lineEdge.p1.p, smax < 1 ? smax : 1, va)]

    if (noEndpointTouch && smin === 0 && smax === 1) return null

    return [
      toPoint(lineEdge.p1.p, smin > 0 ? smin : 0, va),
      toPoint(lineEdge.p1.p, smax < 1 ? smax : 1, va)
    ] as [Position, Position]
  }

  return null
}
