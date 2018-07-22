import Rectangle = Phaser.Geom.Rectangle;
import {ExtPoint} from "./ext-point";
import Qix from "../scenes/qix";
import Polygon = Phaser.Geom.Polygon;
import Line = Phaser.Geom.Line;
import {GeomUtils} from "../utils/geom-utils";

export class AllPoints {
    qix: Qix;
    innerPolygonPointsClockwise: ExtPoint[];

    constructor(qix: Qix, rectangle: Rectangle) {
        this.qix = qix;
        this.innerPolygonPointsClockwise = GeomUtils.getClockwiseRectanglePoints(rectangle);
    }

    calculateNewClockwisePolygonPoints(points: ExtPoint[]): ExtPoint[] {
        const newPoints = this.calculateNewPolygonPointsNormal(points);
        const newPolygon = new Polygon(newPoints.map(point => point.point));

        const newInversePoints = this.calculateNewPolygonPointsInverse(points);
        const newInversePolygon = new Polygon(newInversePoints.map(point => point.point));

        // TODO: when enemy added, choose area that enemy is not in...
        const smallerAreaPoints = Math.abs(newPolygon.area) <= Math.abs(newInversePolygon.area) ? newPoints : newInversePoints;
        const newClockwisePoints = GeomUtils.makeClockwisePoints(smallerAreaPoints);

        return newClockwisePoints;
    }

    calculateNewPolygonPointsNormal(points: ExtPoint[]): ExtPoint[] {
        return this.calculateNewPolygonPointsWithInnerPoints(points, this.innerPolygonPointsClockwise.slice(), false);
    }

    calculateNewPolygonPointsInverse(points: ExtPoint[]): ExtPoint[] {
        return this.calculateNewPolygonPointsWithInnerPoints(points.slice(), this.innerPolygonPointsClockwise.slice(), true);
    }

    /**
     * Based on new points drawn and existing inner points - calculate new closed polygon points clockwise. There could be
     *  2 different closed polygons calculated by the newly drawn points, so inverse flag gives the 2 different polygons..
     *
     * @param {ExtPoint[]} points
     * @param {ExtPoint[]} innerPoints
     * @param {boolean} inverse
     * @returns {ExtPoint[]}
     */
    calculateNewPolygonPointsWithInnerPoints(points: ExtPoint[], innerPoints: ExtPoint[], inverse: boolean = false): ExtPoint[] {
        if (inverse) {
            points = points.reverse();
        }

        this.qix.debug.debugConsolePoints('hello', points);

        let polygonPoints: ExtPoint[] = [];
        const firstPoint = points[0];
        const lastPoint = points[points.length - 1];

        const processRestOfPoints = (innerPointIndex: number) => {
            for (let i = 1; i < points.length; i++) {
                polygonPoints.push(points[i]);
            }

            let lastPointPassed: boolean = false;

            for (let i = 0; i < innerPoints.length; i++) {
                let innerPoint1 = innerPoints[innerPointIndex];
                let innerPoint2 = innerPoints[innerPointIndex + 1];
                innerPointIndex = (innerPointIndex < innerPoints.length - 2) ? innerPointIndex + 1 : 0;

                let firstPointBetween = firstPoint.isBetweenTwoPointsInclusive(innerPoint1, innerPoint2);
                let lastPointBetween = lastPoint.isBetweenTwoPointsInclusive(innerPoint1, innerPoint2);

                if (lastPointBetween) {
                    lastPointPassed = true;
                } else if (lastPointPassed) {
                    polygonPoints.push(innerPoint1);
                    if (firstPointBetween) {
                        polygonPoints.push(firstPoint);
                        break;
                    }
                }
            }
        };

        for (let innerPointIndex = 0; innerPointIndex < innerPoints.length - 1; innerPointIndex++) {
            let innerPoint1 = innerPoints[innerPointIndex];
            let innerPoint2 = innerPoints[innerPointIndex + 1];

            let firstPointBetween = firstPoint.isBetweenTwoPointsInclusive(innerPoint1, innerPoint2);
            let lastPointBetween = lastPoint.isBetweenTwoPointsInclusive(innerPoint1, innerPoint2);
            let firstAndLastPointsBetween = firstPointBetween && lastPointBetween;

            if (firstAndLastPointsBetween) {
                polygonPoints = polygonPoints.concat(points);
                polygonPoints.push(firstPoint);
                break;
            } else if (firstPointBetween) {
                polygonPoints.push(firstPoint);
                processRestOfPoints(innerPointIndex);
                break;
            }
        }

        polygonPoints = this.flattenPoints(polygonPoints);

        return polygonPoints;
    }

    /**
     * Remove any points that are in middle of a line
     *
     * @param {ExtPoint[]} points
     * @returns {ExtPoint[]}
     */
    flattenPoints(points: ExtPoint[]): ExtPoint[] {
        let pts: ExtPoint[] = [];

        pts.push(points[0]);
        for (let pointIndex = 0; pointIndex < points.length - 2; pointIndex++) {
            const point1 = points[pointIndex], point2 = points[pointIndex + 1], point3 = points[pointIndex + 2];

            if (! point2.isBetweenTwoPointsInclusive(point1, point3)) {
                pts.push(point2);
            }
        }
        pts.push(points[points.length - 1]);

        // Check if first/last point (same point) should be removed
        // console.info(pts);
        if (pts[0].isBetweenTwoPointsInclusive(pts[pts.length - 2], pts[1])) {
            pts.splice(pts.length - 1, 1);
            pts.splice(0, 1);
            pts.push(pts[0]);
        }

        return pts;
    }


    /**
     * Assumptions:
     * - Both arrays (new polygon, and old inner points) of points go clockwise
     * - Both arrays, first and last point are the same.
     *
     * Algorithm (come back to this to make more efficient...)
     * - Loop through innerPoint lines, and then loop through polygon lines, and find all overlaps.
     *      and record "bisection" point.
     * - Replace inner point lines based on bisection point
     * - Insert the remaining non overlap lines from new polygon in counter clockwise fashion.
     *
     * @param {ExtPoint[]} newPolygonPoints
     * @param {ExtPoint[]} innerPoints
     * @returns {ExtPoint[]}
     */
    updateNewInnerPoints(newPolygonPoints: ExtPoint[]): void {
        const polygonLines: Line[] = GeomUtils.getLinesFromPolygonPoints(newPolygonPoints);
        // Remove the last point which is the repeated first point
        const polygonPoints = newPolygonPoints.splice(newPolygonPoints.length - 1, 1);
        const innerLines: Line[] = GeomUtils.getLinesFromPolygonPoints(this.innerPolygonPointsClockwise);


        //
        // First find a starting inner line index where it overlaps with a polygon line
        //
        let startingInnerLineIndex = 0;
        outer:
        for (startingInnerLineIndex = 0; startingInnerLineIndex < innerLines.length; startingInnerLineIndex++) {
            const innerLine = innerLines[startingInnerLineIndex];
            for (let polygonLinesIndex = 0; polygonLinesIndex < polygonLines.length; polygonLinesIndex++) {
                const polygonLine = polygonLines[polygonLinesIndex];
                if (GeomUtils.linesAreEqual(innerLine, polygonLine) || GeomUtils.lineContainsLine(innerLine, polygonLine)) {
                    break outer;
                }
            }
        }

        const nextIndex = (array: any[], index: integer, increment: integer = 1) => {
            return (index < array.length - increment) ? index + increment: 0;
        };

        //
        // Loop through inner lines starting at the startingInnerLineIndex (and wrap around array)
        //
        let newInnerLinesInsertionIndex = -1;
        let polygonLinesStartIndexForInsertion = 0;
        let newInnerLines: Line[] = [];
        for (let i = 0; i < innerLines.length; i++) {
            const innerLinesIndex = nextIndex(innerLines, i, startingInnerLineIndex);
            const innerLine = innerLines[innerLinesIndex];
            const nextInnerLine = innerLines[nextIndex(innerLines, innerLinesIndex)];

            if (! GeomUtils.lineContainsAnyLine(innerLine, polygonLines)) {
                newInnerLines.push(innerLine);
                // this.qix.debug.debugConsoleLines('newInnerLines1', newInnerLines);
            }
            for (let polygonLinesIndex = 0; polygonLinesIndex < polygonLines.length; polygonLinesIndex++) {
                const polygonLine = polygonLines[polygonLinesIndex];
                const nextPolygonLine = polygonLines[nextIndex(polygonLines, polygonLinesIndex)];

                let lineBisectionToAdd: Line[] = [];

                if (GeomUtils.lineContainsLineAndNotEqual(innerLine, polygonLine)) {
                    lineBisectionToAdd = GeomUtils.subtractLinesWhereLine1ContainsLine2(innerLine, polygonLine);
                    newInnerLines = newInnerLines.concat(lineBisectionToAdd);
                    // console.info('innerLine', innerLine, 'polygonLine', polygonLine);
                    // this.qix.debug.debugConsoleLines('newInnerLines2', newInnerLines);
                }

                if (newInnerLinesInsertionIndex === -1) {
                    if (GeomUtils.linesAreEqual(innerLine, polygonLine) && ! GeomUtils.lineContainsLine(nextInnerLine, nextPolygonLine)) {
                        newInnerLinesInsertionIndex = newInnerLines.length;
                        polygonLinesStartIndexForInsertion = nextIndex(polygonLines, polygonLinesIndex);
                    } else if (lineBisectionToAdd.length === 1 && ! GeomUtils.lineContainsLine(nextInnerLine, nextPolygonLine)) {
                        newInnerLinesInsertionIndex = newInnerLines.length - 1;
                        polygonLinesStartIndexForInsertion = nextIndex(polygonLines, polygonLinesIndex);
                    } else  if (lineBisectionToAdd.length === 2) {
                        newInnerLinesInsertionIndex = newInnerLines.length - 1;
                        polygonLinesStartIndexForInsertion = nextIndex(polygonLines, polygonLinesIndex);
                    }
                }
            }
        }

        //
        // Add all the new polygon non-intersecting lines counter-clockwise
        //
        let polygonLinesToInsert: Line[] = [];
        for (let i = 0; i < polygonLines.length; i++) {
            const polygonLinesIndex = nextIndex(polygonLines, i, polygonLinesStartIndexForInsertion);
            const polygonLine = polygonLines[polygonLinesIndex];

            if (! GeomUtils.lineContainsAnyLine(polygonLine, innerLines)) {
                polygonLinesToInsert.push(polygonLine);
            }
        }
        polygonLinesToInsert = GeomUtils.reverseLines(polygonLinesToInsert);

        // this.qix.debug.debugConsoleLines('newInnerLines', newInnerLines);
        // this.qix.debug.debugConsoleLines('polygonLinesToInsert', polygonLinesToInsert);
        // console.info('newInnerLinesInsertionIndex', newInnerLinesInsertionIndex);

        newInnerLines.splice(newInnerLinesInsertionIndex, 0, ...polygonLinesToInsert);

        // this.qix.debug.debugConsoleLines('oldInnerLines', innerLines);
        // this.qix.debug.debugConsoleLines('newInnerLines', newInnerLines);

        this.innerPolygonPointsClockwise = GeomUtils.getPolygonPointsFromLines(newInnerLines);
        this.innerPolygonPointsClockwise = this.flattenPoints(this.innerPolygonPointsClockwise);

        // this.qix.debug.debugConsolePoints('new inner polygon points clockwise', this.innerPolygonPointsClockwise);
    }


}
