import {Edge} from './Edge'
import {Point} from './Point'
import { BBox } from 'geojson'
import { segmentEach } from '@turf/meta'
import { LineStringOrMultiLineStringFeature } from 'src'

export function fillQueue(line1: LineStringOrMultiLineStringFeature, line2: LineStringOrMultiLineStringFeature, line1Edges: Edge[], line2Edges: Edge[], line1Bbox: BBox) {
  processLine(line1, line1Edges, line1Bbox, true)
  processLine(line2, line2Edges, line1Bbox, false)
}

function processLine (line: LineStringOrMultiLineStringFeature, edges: Edge[], line1Bbox: BBox, fillBbox: boolean) {
  let startPoint = null as null | Point
  let prevEdge = null as null | Edge
  let prevMultiFeatureIndex = 0
  segmentEach(line, function (currentSegment, featureIndex, multiFeatureIndex, geometryIndex, segmentIndex) {
    if (multiFeatureIndex && multiFeatureIndex !== prevMultiFeatureIndex) {
      prevEdge = null
      startPoint = null
      prevMultiFeatureIndex = multiFeatureIndex
    }
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

        if (fillBbox) {
          line1Bbox[0] = Math.min(line1Bbox[0], startPoint.p[0])
          line1Bbox[1] = Math.min(line1Bbox[1], startPoint.p[1])
          line1Bbox[2] = Math.max(line1Bbox[2], startPoint.p[0])
          line1Bbox[3] = Math.max(line1Bbox[3], startPoint.p[1])
        } else {
          edge.setIntersectsLine1Bbox(line1Bbox)
        }
        prevEdge = edge
        startPoint = nextPoint
      }
    }
  })
  if (fillBbox && startPoint) {
    line1Bbox[0] = Math.min(line1Bbox[0], startPoint.p[0])
    line1Bbox[1] = Math.min(line1Bbox[1], startPoint.p[1])
    line1Bbox[2] = Math.max(line1Bbox[2], startPoint.p[0])
    line1Bbox[3] = Math.max(line1Bbox[3], startPoint.p[1])
  }
}

