import {Edge} from './Edge'
import {Point} from './Point'
import { BBox, Feature, LineString } from 'geojson'
import { segmentEach } from '@turf/meta'

export function fillQueue(line1: Feature<LineString> | LineString, line2: Feature<LineString> | LineString, line1Edges: Edge[], line2Edges: Edge[], line1Bbox: BBox) {
  processLine(line1, line1Edges, line1Bbox, true)
  processLine(line2, line2Edges, line1Bbox, false)
}

function processLine (line: Feature<LineString> | LineString, edges: Edge[], line1Bbox: BBox, fillBbox: boolean) {
  let startPoint = null as null | Point
  let prevEdge = null as null | Edge
  segmentEach(line, function (currentSegment) {
    if (currentSegment) {
      if (startPoint === null && currentSegment) startPoint = new Point(currentSegment.geometry.coordinates[0])
      if (startPoint) {
        const nextPoint = new Point(currentSegment.geometry.coordinates[1])
        const edge = new Edge(startPoint, nextPoint)   
        edges.push(edge) 
        if (prevEdge) {
          prevEdge.setNextEdge(edge)
          edge.setPrevEdge(prevEdge)
        }
        prevEdge = edge
        startPoint = nextPoint
        if (fillBbox) {
          line1Bbox[0] = Math.min(line1Bbox[0], nextPoint.p[0])
          line1Bbox[1] = Math.min(line1Bbox[1], nextPoint.p[1])
          line1Bbox[2] = Math.max(line1Bbox[2], nextPoint.p[0])
          line1Bbox[3] = Math.max(line1Bbox[3], nextPoint.p[1])          
        } else {
          edge.setIntersectsLine1Bbox(line1Bbox)
        }
      }
    }
  })
}

