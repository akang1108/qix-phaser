import Polygon = Phaser.Geom.Polygon;
import Line = Phaser.Geom.Line;
import Point = Phaser.Geom.Point;
import {Grid} from "./grid";
import {ExtPoint} from "./ext-point";
import Rectangle = Phaser.Geom.Rectangle;

/**
 * Point with additional helper methods. Decorates existing Phaser Point class.
 */
export class ExtPolygon {
    percentArea: string;
    polygon: Polygon;
    lines: Line[] = [];

    constructor(points: Point[], frameArea: number) {
        this.polygon = this.createPolygon(points);
        this.lines = this.createLines(points);
        this.percentArea = this.calculatePercentArea(this.polygon, frameArea);
    }

    createPolygon(points: Point[]): Polygon {
        return new Polygon(points);
    }

    createLines(points: Point[]): Line[] {
        let lines: Line[] = [];

        for (let i = 0; i < points.length - 1; i++) {
            lines.push(new Line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y));
        }

        lines.push(new Line(points[points.length - 1].x, points[points.length -1].y, points[0].x, points[0].y));

        return lines;
    }

    calculatePercentArea(polygon: Polygon, frameArea: number): string {
        return ((Math.abs(this.polygon.area) / frameArea) * 100).toFixed(1);
    }

    draw(grid: Grid) {
        const points = this.polygon.points;

        grid.graphics.beginPath();
        grid.graphics.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            grid.graphics.lineTo(points[i].x, points[i].y);
        }

        grid.graphics.lineTo(points[0].x, points[0].y);

        grid.graphics.closePath();
        grid.graphics.strokePath();
        grid.graphics.fillPath();

        this.lines.forEach((line) => grid.lineGraphics.strokeLineShape(line));
    }

    outlineIntersects(point: ExtPoint): boolean {
        for (let i = 0; i < this.lines.length; i++) {
            if (Phaser.Geom.Intersects.PointToLineSegment(point.point, this.lines[i])) {
                return true;
            }
        }

        return false;
    }

    /**
     * Reference for algorithm: https://www.geeksforgeeks.org/how-to-check-if-a-given-point-lies-inside-a-polygon/
     *
     * @param {ExtPoint} point
     * @returns {boolean}
     */
    innerIntersects(point: ExtPoint): boolean {
        if (this.outlineIntersects(point)) {
            return false;
        }

        if (this.horizontalLineSameXValue(point)) {
            return false;
        }

        const mostRightPointXValue = this.getMostRightPointXValue();

        if (point.x() >= mostRightPointXValue) {
            return false;
        }

        const numIntersections = this.getNumberOfIntersections(new Line(point.x(), point.y(), mostRightPointXValue, point.y()));

        return numIntersections % 2 === 1;
    }

    getNumberOfIntersections(line: Line): integer {
        return this.lines.reduce((previousValue, currentLine) => {
            return previousValue + (Phaser.Geom.Intersects.LineToLine(currentLine, line) ? 1 : 0);
        }, 0)
    }

    // createLineToRightEdge(startingPoint: ExtPoint) {
    // }

    getMostRightPointXValue(): integer {
        return this.lines.reduce((previousValue, currentLine) => {
            return Math.max(previousValue, currentLine.x1, currentLine.x2);
        }, 0);
    }

    horizontalLineSameXValue(point: ExtPoint): boolean {
        const y = point.y();

        const horizontalLines: Line[] = this.lines.filter((line) => {
           return (line.y1 === line.y2);
        });

        return horizontalLines.some((line) => {
            return line.y1 === y;
        });
    }

    toRectangles(): Rectangle[] {
        let rects: Rectangle[] = [];

        return rects;
    }
}
