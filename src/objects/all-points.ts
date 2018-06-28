import Rectangle = Phaser.Geom.Rectangle;
import Point = Phaser.Geom.Point;
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
        this.innerPolygonPointsClockwise = this.getClockwiseRectanglePoints(rectangle);
    }

    calculateNewPolygonPoints(points: ExtPoint[]): ExtPoint[] {
        const clockwisePoints = this.calculateNewPolygonPointsNormal(points);
        const counterClockwisePoints = this.calculateNewPolygonPointsInverse(points);

        const clockwisePolygon = new Polygon(clockwisePoints.map(point => point.point));
        const counterClockwisePolygon = new Polygon(counterClockwisePoints.map(point => point.point));

        // Current algorithm - pick smaller area
        const clockwise = Math.abs(clockwisePolygon.area) <= Math.abs(counterClockwisePolygon.area);

        return clockwise ? clockwisePoints : counterClockwisePoints;
    }

    calculateNewPolygonPointsNormal(points: ExtPoint[]): ExtPoint[] {
        return this.calculateNewPolygonPointsWithInnerPoints(points, this.innerPolygonPointsClockwise.slice(), false);
    }

    calculateNewPolygonPointsInverse(points: ExtPoint[]): ExtPoint[] {
        return this.calculateNewPolygonPointsWithInnerPoints(points.slice(), this.innerPolygonPointsClockwise.slice(), true);
    }

    calculateNewPolygonPointsWithInnerPoints(points: ExtPoint[], innerPoints: ExtPoint[], inverse: boolean = false): ExtPoint[] {
        const reorderedPoints = this.reorderPoints(points, innerPoints);
        const first = reorderedPoints[0];
        const last = reorderedPoints[reorderedPoints.length - 1];
        let passedFirstPoint: boolean = false;
        let passedLastPoint: boolean = false;
        let polygonPoints: ExtPoint[] = [];

        for (let i = 0; i < innerPoints.length - 1; i++) {
            if (! inverse && (! passedFirstPoint || (passedFirstPoint && passedLastPoint))) {
                polygonPoints.push(innerPoints[i]);
            } else if (inverse && passedFirstPoint && ! passedLastPoint) {
                polygonPoints.push(innerPoints[i]);
            }

            if (first.isBetweenTwoPointsInclusive(innerPoints[i], innerPoints[i + 1])) {
                passedFirstPoint = true;

                if (! inverse) {
                    polygonPoints = polygonPoints.concat(reorderedPoints);
                } else {
                    polygonPoints.push(first);
                }
            }

            if (last.isBetweenTwoPointsInclusive(innerPoints[i], innerPoints[i + 1])) {
                passedLastPoint = true;
            }
        }

        if (! inverse) {
            polygonPoints.push(innerPoints[innerPoints.length - 1]);
        } else {
            polygonPoints = polygonPoints.concat(reorderedPoints.slice().reverse());
        }

        return polygonPoints;
    }

    calculateNewInnerPoints(newPolygonPoints: ExtPoint[], innerPoints: ExtPoint[]): ExtPoint[] {
        const newInnerPoints: ExtPoint[] = [];
        let contains = false;
        let newPolygonPointsIndex = 0;

        for (let innerPointsIndex = 0; innerPointsIndex < innerPoints.length - 1; innerPointsIndex++) {
            let innerPoint1 = innerPoints[innerPointsIndex];
            let innerPoint2 = innerPoints[innerPointsIndex + 1];
            let innerLine = new Line(innerPoint1.x(), innerPoint1.y(), innerPoint2.x(), innerPoint2.y());

            for (newPolygonPointsIndex = 0; newPolygonPointsIndex < newPolygonPoints.length - 1; newPolygonPointsIndex++) {
                let newPolygonPoint1 = newPolygonPoints[newPolygonPointsIndex];
                let newPolygonPoint2 = newPolygonPoints[newPolygonPointsIndex + 1];
                let newPolygonLine = new Line(newPolygonPoint1.x(), newPolygonPoint1.y(), newPolygonPoint2.x(), newPolygonPoint2.y());
                if (GeomUtils.lineContainsLine(innerLine, newPolygonLine)) {
                    contains = true;
                    break;
                }
            }

            if (! contains) {
                newInnerPoints.push(innerPoint1);
            }
        }


        return newInnerPoints;
    }

    xcalculateNewInnerPoints(points: ExtPoint[], innerPoints: ExtPoint[]): ExtPoint[] {
        return[];
    }

    /**
     * Return new array of points to follow same order (clockwise or counterclockwise) of inner polygon points
     *
     * @param {ExtPoint[]} points
     * @returns {ExtPoint[]}
     */
    reorderPoints(points: ExtPoint[], innerPoints: ExtPoint[]) {
        points = points.slice();
        const first = points[0];
        const last = points[points.length - 1];
        let firstIndex: integer, lastIndex: integer;

        for (let i = 0; i < innerPoints.length - 1; i++) {
            if (first.isBetweenTwoPointsInclusive(innerPoints[i], innerPoints[i + 1])) {
                firstIndex = i;
            }

            if (last.isBetweenTwoPointsInclusive(innerPoints[i], innerPoints[i + 1])) {
                lastIndex = i;
            }
        }

        if (lastIndex < firstIndex) {
            points.reverse();
        } else if (lastIndex == firstIndex && first.isAfter(last, innerPoints[firstIndex], innerPoints[firstIndex + 1])) {
            points.reverse();
        }

        return points;
    }


    updateInnerPolygon(): void {

    }



    /*
    extrapolatePointsAndUpdateInnerPolygon(points: ExtPoint[]): ExtPoint[] {
        const clockwisePoints = this.extrapolatePoints(points, true, false);
        const counterClockwisePoints = this.extrapolatePoints(points, false, false);

        const clockwisePolygon = new Polygon(clockwisePoints.map(point => point.point));
        const counterClockwisePolygon = new Polygon(counterClockwisePoints.map(point => point.point));

        // Current algorithm - pick smaller area
        const clockwise = Math.abs(clockwisePolygon.area) <= Math.abs(counterClockwisePolygon.area);

        this.extrapolatePoints(points, clockwise, true);

        return clockwise ? clockwisePoints : counterClockwisePoints;
    }

    extrapolatePoints(points: ExtPoint[], clockwise: boolean, updateInnerPolygon: boolean): ExtPoint[] {
        const extrapolatedPoints: ExtPoint[] = points.map((point) => point);
        const firstPoint = points[0];
        const lastPoint = points[points.length - 1];

        const lines = clockwise ? this.innerPolygonClockwiseLines : this.innerPolygonClockwiseLines.slice().reverse();

        let lastPointInnerLineIntersectIndex: integer, firstPointInnerLineIntersectIndex: integer,
            injectLine1: Line, injectLine2: Line,
            injectInnerLines: Line[] = [],
            newInnerLinesClockwise;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];

            if (Phaser.Geom.Intersects.PointToLineSegment(lastPoint.point, line)) {
                lastPointInnerLineIntersectIndex = i;
                injectLine1 = clockwise ? new Line(line.x1, line.y1, lastPoint.x(), lastPoint.y()) : new Line(lastPoint.x(), lastPoint.y(), line.x2, line.y2);

                while (! Phaser.Geom.Intersects.PointToLineSegment(firstPoint.point, line)) {
                    if (clockwise) {
                        extrapolatedPoints.push(new ExtPoint(new Point(line.x2, line.y2)));
                    } else {
                        extrapolatedPoints.push(new ExtPoint(new Point(line.x1, line.y1)));
                    }

                    i = this.nextIndex(lines.length, i);
                    line = lines[i];
                }

                firstPointInnerLineIntersectIndex = i;
                injectLine2 = clockwise ? new Line(firstPoint.x(), firstPoint.y(), line.x2, line.y2) : new Line(line.x1, line.y1, firstPoint.x(), firstPoint.y());

                break;
            }
        }

        if (updateInnerPolygon) {

            if (clockwise) {
                injectInnerLines.push(injectLine1);
                for (let i = points.length - 1; i > 0; i--) {
                    const p1 = points[i], p2 = points[i - 1];
                    injectInnerLines.push(new Line(p1.x(), p1.y(), p2.x(), p2.y()));
                }
                injectInnerLines.push(injectLine2);
            } else {
                injectInnerLines.push(injectLine2);
                for (let i = 0; i < points.length - 1; i++) {
                    const p1 = points[i], p2 = points[i + 1];
                    injectInnerLines.push(new Line(p1.x(), p1.y(), p2.x(), p2.y()));
                }
                injectInnerLines.push(injectLine1);
            }

            newInnerLinesClockwise = this.innerPolygonClockwiseLines.slice();
            if (firstPointInnerLineIntersectIndex < lastPointInnerLineIntersectIndex) {
                newInnerLinesClockwise.splice(lastPointInnerLineIntersectIndex, newInnerLinesClockwise.length - lastPointInnerLineIntersectIndex);
                newInnerLinesClockwise.splice(0, firstPointInnerLineIntersectIndex + 1);
            } else {
                newInnerLinesClockwise.splice(lastPointInnerLineIntersectIndex, (firstPointInnerLineIntersectIndex - lastPointInnerLineIntersectIndex + 1));
            }

            newInnerLinesClockwise.splice(lastPointInnerLineIntersectIndex, 0, ...injectInnerLines);

            this.innerPolygonClockwiseLines = newInnerLinesClockwise;

            if (Debug.DEBUG) {
                this.drawNextDebug(
                    this.innerPolygonClockwiseLines,
                    0,
                    0,
                    3000,
                    0xFF0000,
                    3);

                this.drawNextDebug(
                    injectInnerLines,
                    0,
                    10,
                    1000,
                    0x00FF00,
                    5);
            }

            console.info(`lastPointInnerLineIntersectIndex: ${lastPointInnerLineIntersectIndex}  firstPointInnerLineIntersectIndex: ${firstPointInnerLineIntersectIndex}`);
            console.info(`injectInnerLines`);
            console.table(injectInnerLines);
            console.info(`newInnerLinesClockwise`);
            console.table(newInnerLinesClockwise);
            // console.info(`lines:` + lines.map(line => '(' + StringUtils.prettyLine(line) + ')'));
        }

        return extrapolatedPoints;
    }

    drawNextDebug(lines: Line[], index: integer, t1: integer, t2: integer, color: number, size: number) {
        if (index > lines.length - 1) {
            return;
        }

        const g = this.qix.add.graphics();
        g.lineStyle(size, color);
        g.strokeLineShape(lines[index]);
        setTimeout(() => {
            this.drawNextDebug(lines, index + 1, t1, t2, color, size);
        }, t1);

        setTimeout(() => {
            g.destroy();
        }, (t2 - (t1 * index)));
    }

    nextIndex(length: integer, i: integer): integer {
        if (i === length - 1) {
            return 0;
        } else {
            return i + 1;
        }
    }
    */

    private getClockwiseRectanglePoints(rectangle: Rectangle): ExtPoint[] {
        let points: ExtPoint[] = [];
        points.push(new ExtPoint(new Point(rectangle.left, rectangle.top)));
        points.push(new ExtPoint(new Point(rectangle.right, rectangle.top)));
        points.push(new ExtPoint(new Point(rectangle.right, rectangle.bottom)));
        points.push(new ExtPoint(new Point(rectangle.left, rectangle.bottom)));
        points.push(new ExtPoint(new Point(rectangle.left, rectangle.top)));
        return points;
    }
}
