import { BBox } from "geojson"
import { IntersectionPoint } from "./IntersectionPoint"
import { Point } from "./Point"

export class Edge {
  p1: Point
  p2: Point
  minX: number
  minY: number
  maxX: number
  maxY: number
  intersectionPoints: IntersectionPoint[]
  nextEdge: null | Edge
  prevEdge: null | Edge

  intersectsLine1Bbox: null | boolean

  constructor(p1: Point, p2: Point) {
    this.p1 = p1
    this.p2 = p2

    this.minX = Math.min(p1.p[0], p2.p[0])
    this.minY = Math.min(p1.p[1], p2.p[1])

    this.maxX = Math.max(p1.p[0], p2.p[0])
    this.maxY = Math.max(p1.p[1], p2.p[1])

    this.intersectionPoints = [] as IntersectionPoint[]
    this.nextEdge = null
    this.prevEdge = null
    this.intersectsLine1Bbox = null
  }

  setIntersectsLine1Bbox (bbox: BBox) {
    if (this.maxX < bbox[0]) return this.intersectsLine1Bbox = false
    if (this.minX > bbox[2]) return this.intersectsLine1Bbox = false
    if (this.maxY < bbox[1]) return this.intersectsLine1Bbox = false
    if (this.minY > bbox[3]) return this.intersectsLine1Bbox = false
    this.intersectsLine1Bbox = true
  }

  setNextEdge (edge: Edge) {
    this.nextEdge = edge
  }

  setPrevEdge (edge: Edge) {
    this.prevEdge = edge
  }

}
