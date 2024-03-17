import { Position } from "geojson"
import { Edge } from "./Edge"

export class IntersectionPoint {
  p: Position
  line1Edge: Edge
  line2Edge: Edge
  distanceFromLine1EdgeStart: number
  distanceFromLine2EdgeStart: number

  constructor(p: Position, edge1: Edge, edge2: Edge) {
    this.p = p
    this.line1Edge = edge1
    this.line2Edge = edge2

    this.distanceFromLine1EdgeStart = distance(this.line1Edge.p1.p, this.p)
    this.distanceFromLine2EdgeStart = distance(this.line2Edge.p1.p, this.p)

    this.line1Edge.intersectionPoints.push(this)
    this.line2Edge.intersectionPoints.push(this)  
  }

  isSamePoint(p: Position) {
    return this.p[0] === p[0] && this.p[1] === p[1]
  }
}

function distance(p1: Position, p2: Position) {
  let xs = p2[0] - p1[0]
  let ys = p2[1] - p1[1]
  xs *= xs
  ys *= ys

  return Math.sqrt(xs + ys)
}
