import Rectangle = Phaser.Geom.Rectangle;
import Point = Phaser.Geom.Point;
import {ExtPoint} from "./ext-point";
import Qix from "../scenes/qix";
import Polygon = Phaser.Geom.Polygon;
import Line = Phaser.Geom.Line;

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
        // TODO: when enemy added, choose area that enemy is not in...
        const clockwise = Math.abs(clockwisePolygon.area) <= Math.abs(counterClockwisePolygon.area);
        console.info(clockwise);

        return clockwise ? clockwisePoints : counterClockwisePoints;
    }

    calculateNewPolygonPointsNormal(points: ExtPoint[]): ExtPoint[] {
        return this.calculateNewPolygonPointsWithInnerPoints(points, this.innerPolygonPointsClockwise.slice(), false);
    }

    calculateNewPolygonPointsInverse(points: ExtPoint[]): ExtPoint[] {
        return this.calculateNewPolygonPointsWithInnerPoints(points.slice(), this.innerPolygonPointsClockwise.slice(), true);
    }

    calculateNewPolygonPointsWithInnerPoints(points: ExtPoint[], innerPoints: ExtPoint[], inverse: boolean = false): ExtPoint[] {
        // console.info(`inverse:${inverse}`);

        const reorderedPoints = this.reorderPoints(points, innerPoints);

        if (!inverse) {
            console.info(`reorderdPoints`);
            reorderedPoints.forEach((point) => console.info(point.point));
        }

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

        //polygonPoints.forEach((point) => console.info(point.point));

        return polygonPoints;
    }

    /**
     * Assumptions:
     * - Both arrays (new polygon, and old inner points) of points go clockwise
     * - Both arrays, first and last point are the same.
     * -
     *
     *
     * Algorithm (come back to this to make more efficient...)
     * - Loop through innerPoint lines, and then loop through polygon lines, and find all overlaps. and record "bisection" point.
     * - Replace inner point lines based on bisection point
     * - Insert the remaining non overlap lines from new polygon in counter clockwise fashion.
     *
     * @param {ExtPoint[]} newPolygonPoints
     * @param {ExtPoint[]} innerPoints
     * @returns {ExtPoint[]}
     */
    updateNewInnerPoints(newPolygonPoints: ExtPoint[]): void {
        const polygonLines: Line[] = this.getLinesFromPolygonPoints(newPolygonPoints);
        const polygonLinesLength = polygonLines.length;
        const innerLines: Line[] = this.getLinesFromPolygonPoints(this.innerPolygonPointsClockwise);
        const innerLinesLength = innerLines.length;
        let newInnerLines: Line[] = [];
        let innerPolygonLinesOverlap: Line[] = [];

        let innerInjectIndex = -1;
        let polygonLineIndicesOverlap: integer[] = [];

        for (let innerLinesIndex = 0; innerLinesIndex < innerLinesLength; innerLinesIndex++) {
            const innerLine = innerLines[innerLinesIndex];

            let overlap = false;
            let linesDiff: Line[] = [];

            for (let polygonLinesIndex = 0; polygonLinesIndex < polygonLinesLength; polygonLinesIndex++) {
                const polygonLine = polygonLines[polygonLinesIndex];

                if (this.lineContainsLine(innerLine, polygonLine)) {
                    linesDiff = this.subtractLinesWhereLine1ContainsLine2(innerLine, polygonLine);
                    overlap = true;
                    innerPolygonLinesOverlap.push(polygonLine);
                    polygonLineIndicesOverlap.push(polygonLinesIndex);
                    break;
                }
            }

            if (overlap) {
                if (innerInjectIndex === -1) {
                    if (linesDiff.length === 2) {
                        innerInjectIndex = innerLinesIndex + 1;
                    } else {
                        innerInjectIndex = innerLinesIndex;
                    }
                } else {
                    if (innerLinesIndex === (innerInjectIndex + 1)) {
                        innerInjectIndex += 1;
                    }
                }

                newInnerLines = newInnerLines.concat(linesDiff);
            } else {
                newInnerLines.push(innerLine);
            }
        }

        //
        // Push non overlapping polygon lines at the inject index counter-clockwise to complete the new inner polygon.
        //
        let injectInnerLines: Line[] = [];
        for (let polygonLinesIndex = polygonLinesLength - 1; polygonLinesIndex >= 0; polygonLinesIndex--) {
            if (! (polygonLineIndicesOverlap.some((index) => { return index === polygonLinesIndex; } ))) {
                const polygonLine = polygonLines[polygonLinesIndex];
                injectInnerLines.push(this.reverseLine(polygonLine));
            }
        }

        newInnerLines.splice(innerInjectIndex, 0, ...injectInnerLines);
        this.innerPolygonPointsClockwise = this.getPolygonPointsFromLines(newInnerLines);

        // newInnerLines.forEach((line) => {console.info(line); } );
        // console.info(`innerInjectIndex:${innerInjectIndex}`);


        // console.info(`innerPolygonPointsClockwise:`);
        // this.innerPolygonPointsClockwise.forEach((point) => {console.info(point.point)});
    }

    reverseLine(line: Line): Line {
        return new Line(line.x2, line.y2, line.x1, line.y1);
    };

    /**
     * Current assumptions - they move in the same direction and they are only vertical or horizontal...
     *
     * @param {Phaser.Geom.Line} line1
     * @param {Phaser.Geom.Line} line2
     * @returns {boolean}
     *
     */
    lineContainsLine(line1: Line, line2: Line): boolean {
        if (line1.x1 === line1.x2 && line1.x1 === line2.x1 && line1.x1 === line2.x2) {
            return (line2.y1 >= line1.y1 && line2.y2 <= line2.y2) ||
                   (line2.y2 >= line1.y2 && line2.y1 <= line2.y1);
        }

        if (line1.y1 === line1.y2 && line1.y1 === line2.y1 && line1.y1 === line2.y2) {
            return (line2.x1 >= line1.x1 && line2.x2 <= line2.x2) ||
                   (line2.x2 >= line1.x2 && line2.x1 <= line2.x1);
        }

        return false;
    }

    /**
     * Current assumptions - they move in the same direction and they are only vertical or horizontal...
     *
     * @param {Phaser.Geom.Line} line1
     * @param {Phaser.Geom.Line} line2
     * @returns {Phaser.Geom.Line[]}
     */
    subtractLinesWhereLine1ContainsLine2(line1: Line, line2: Line): Line[] {
        const vertical = line1.x1 === line1.x2;
        const horizontal = line1.y1 === line1.y2;

        if (! vertical && ! horizontal) {
            throw new Error("Only supports vertical or horizontal lines.");
        }

        if (line1.x1 === line2.x1 && line1.y1 === line2.y1 && line1.x2 === line2.x2 && line1.y2 === line2.y2) {
            return [];
        } else if (vertical) {
            const x = line1.x1;
            if (line1.y1 === line2.y1) {
                return [ new Line(x, line2.y2, x, line1.y2) ];
            } else if (line1.y2 === line2.y2) {
                return [ new Line(x, line1.y1, x, line2.y1) ];
            } else {
                return [ new Line(x, line1.y1, x, line2.y1), new Line(x, line2.y2, x, line1.y2) ];
            }
        } else if (horizontal) {
            const y = line1.y1;
            if (line1.x1 === line2.x1) {
                return [ new Line(line2.x2, y, line1.x2, y) ];
            } else if (line1.x2 === line2.x2) {
                return [ new Line(line1.x1, y, line2.x1, y) ];
            } else {
                return [ new Line(line1.x1, y, line2.x1, y), new Line(line2.x2, y, line1.x2, y) ];
            }
        }
    }

    getLinesFromPolygonPoints(points: ExtPoint[]): Line[] {
        const length = points.length;

        if (length < 3) {
            throw new Error('Expecting at least 3 points in a polygon');
        }

        if (! points[0].equals(points[length - 1])) {
            throw new Error('Expecting first point to equal last point');
        }

        let lines: Line[] = [];

        for (let i = 0; i < length - 1; i++) {
            lines.push(new Line(points[i].x(), points[i].y(),points[i + 1].x(), points[i + 1].y()));
        }

        return lines;
    }

    getPolygonPointsFromLines(lines: Line[]): ExtPoint[] {
        let points: ExtPoint[] = lines.map((line) => new ExtPoint(new Point(line.x1, line.y1)));
        points.push(new ExtPoint(new Point(points[0].x(), points[0].y())));

        return points;
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
