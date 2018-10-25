import * as Phaser from 'phaser';
declare type integer = number;

import Rectangle = Phaser.Geom.Rectangle;
import {ExtPoint} from "./ext-point";
import QixScene from "../scenes/qix-scene";
import Polygon = Phaser.Geom.Polygon;
import Line = Phaser.Geom.Line;
import {GeomUtils} from "../utils/geom-utils";
import {Debug} from "./debug";

export class AllPoints {
    scene: QixScene;
    innerPolygonPointsClockwise: ExtPoint[];

    constructor(scene: QixScene, rectangle: Rectangle) {
        this.scene = scene;
        this.innerPolygonPointsClockwise = GeomUtils.getClockwiseRectanglePoints(rectangle);
    }

    calculateNewClockwisePolygonPoints(points: ExtPoint[]): ExtPoint[] {
        const newPoints = this.calculateNewPolygonPointsNormal(points);
        const newPolygon = new Polygon(newPoints.map(point => point.point));

        const newInversePoints = this.calculateNewPolygonPointsInverse(points);
        const newInversePolygon = new Polygon(newInversePoints.map(point => point.point));

        // TODO: when enemy added, choose area that enemy is not in...
        const smallerAreaPoints = Math.abs(newPolygon.area) <= Math.abs(newInversePolygon.area) ? newPoints : newInversePoints;
        let newClockwisePoints = GeomUtils.makeClockwisePoints(smallerAreaPoints);

        // Remove the last point which is the repeated first point
        newClockwisePoints.splice(newClockwisePoints.length - 1, 1);

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
     * @returns {ExtPoint[]} - the last point is not a repeat of the first point
     */
    calculateNewPolygonPointsWithInnerPoints(points: ExtPoint[], innerPoints: ExtPoint[], inverse: boolean = false): ExtPoint[] {
        if (inverse) {
            points = points.reverse();
        }

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
        if (pts[0].isBetweenTwoPointsInclusive(pts[pts.length - 2], pts[1])) {
            pts.splice(pts.length - 1, 1);
            pts.splice(0, 1);
            pts.push(pts[0]);
        }

        return pts;
    }

    /**
     * - Loop through innerPoint lines, and then loop through polygon lines, and find all overlaps.
     *      and record "bisection" point.
     * - Replace inner point lines based on bisection point
     * - Insert the remaining non overlap lines from new polygon in counter clockwise fashion.
     *
     * @param {ExtPoint[]} newPolygonPoints
     * @param {ExtPoint[]} innerPoints
     */
    updateNewInnerPoints(newPolygonPoints: ExtPoint[]): void {
        const polygonLines: Line[] = GeomUtils.getLinesFromPolygonPoints(newPolygonPoints);
        const innerLines: Line[] = GeomUtils.getLinesFromPolygonPoints(this.innerPolygonPointsClockwise);

        // this.qix.debug.infoLines('innerLines initial', innerLines);

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
            return (index < (array.length - increment)) ? (index + increment): ((index + increment) - array.length);
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

            if (! GeomUtils.lineOverlapsAnyLine(innerLine, polygonLines)) {
                newInnerLines.push(innerLine);
            }
            for (let polygonLinesIndex = 0; polygonLinesIndex < polygonLines.length; polygonLinesIndex++) {
                const polygonLine = polygonLines[polygonLinesIndex];
                let lineBisectionToAdd: Line[] = [];

                if (GeomUtils.lineContainsLineAndNotEqual(innerLine, polygonLine)) {
                    lineBisectionToAdd = GeomUtils.subtractLinesWhereLine1ContainsLine2(innerLine, polygonLine);
                    newInnerLines = newInnerLines.concat(lineBisectionToAdd);
                }

                if (GeomUtils.lineContainsLineAndNotEqual(polygonLine, innerLine)) {
                    lineBisectionToAdd = GeomUtils.subtractLinesWhereLine1ContainsLine2(polygonLine, innerLine);
                    lineBisectionToAdd = GeomUtils.reverseLines(lineBisectionToAdd);
                    newInnerLines = newInnerLines.concat(lineBisectionToAdd);
                }
            }
        }

        this.scene.debug.infoLines('newInnerLines before adding inner polygon', newInnerLines);

        //
        // Add all the new polygon non-intersecting lines counter-clockwise
        //
        let polygonLinesToInsert: Line[] = [];
        for (let i = 0; i < polygonLines.length; i++) {
            const polygonLinesIndex = nextIndex(polygonLines, i, polygonLinesStartIndexForInsertion);
            const polygonLine = polygonLines[polygonLinesIndex];

            if (! GeomUtils.linesOverlapsLine(innerLines, polygonLine)) {
                polygonLinesToInsert.push(polygonLine);
            }
        }

        polygonLinesToInsert = GeomUtils.reverseLines(polygonLinesToInsert);

        this.scene.debug.infoLines('polygonLinesToInsert', polygonLinesToInsert);

        // Calculate where to insert inner polygon lines
        if (polygonLinesToInsert.length > 0) {
            const lastPolygonLineToInsert = polygonLinesToInsert[polygonLinesToInsert.length - 1];
            for (newInnerLinesInsertionIndex = 0; newInnerLinesInsertionIndex < newInnerLines.length; newInnerLinesInsertionIndex++) {
                const innerLine = newInnerLines[newInnerLinesInsertionIndex];
                if (innerLine.x1 === lastPolygonLineToInsert.x2 && innerLine.y1 === lastPolygonLineToInsert.y2) {
                    break;
                }
            }

            this.scene.debug.info(`newInnerLinesInsertionIndex: ${newInnerLinesInsertionIndex}`);
            newInnerLines.splice(newInnerLinesInsertionIndex, 0, ...polygonLinesToInsert);
        }

        // this.scene.debug.infoLines('newInnerLines after adding inner polygon', newInnerLines);

        this.innerPolygonPointsClockwise = GeomUtils.getPolygonPointsFromLines(newInnerLines);

        this.innerPolygonPointsClockwise = this.flattenPoints(this.innerPolygonPointsClockwise);
    }


}
