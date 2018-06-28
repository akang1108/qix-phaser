import {ExtPoint} from "../objects/ext-point";
import Line = Phaser.Geom.Line;
import Point = Phaser.Geom.Point;

export class GeomUtils {

    /**
     * Used algorithm from https://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-points-are-in-clockwise-order
     *
     * @param {ExtPoint[]} points
     * @returns {boolean}
     */
    static isClockwise(points: ExtPoint[]): boolean {
        let sum: integer = 0;

        for (let i = 0; i < points.length - 1; i++) {
            sum += (points[i + 1].x() - points[i].x()) * (points[i + 1].y() - points[i].y());
        }

        sum += (points[0].x() - points[0].x()) * (points[points.length - 1].y() - points[points.length - 1].y());

        return sum >= 0;
    }

    static isCounterClockwise(points: ExtPoint[]): boolean {
        return ! GeomUtils.isClockwise(points);
    }

    static createLinesFromPoints(points: ExtPoint[]): Line[] {
        let lines: Line[] = [];

        for (let i = 0; i < points.length - 1; i++) {
            lines.push(new Line(points[i].x(), points[i].y(), points[i + 1].x(), points[i + 1].y()));
        }

        lines.push(new Line(points[points.length - 1].x(), points[points.length - 1].y(), points[0].x(), points[0].y()));

        return lines;
    }

    static lineContainsLine(line1: Line, line2: Line): boolean {
        const line2Point1 = new Point(line2.x1, line2.y1);
        const line2Point2 = new Point(line2.x1, line2.y2);

        return Phaser.Geom.Intersects.PointToLineSegment(line2Point1, line1) &&
               Phaser.Geom.Intersects.PointToLineSegment(line2Point2, line1);
    }

}