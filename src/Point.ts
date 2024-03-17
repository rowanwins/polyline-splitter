import { Position } from "geojson"

export class Point {
  p: Position

  constructor(p: Position) {
    this.p = p
  }

  isSamePoint (p: Position) {
    return this.p[0] === p[0] && this.p[1] === p[1]
  }
}
