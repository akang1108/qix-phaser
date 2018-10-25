import * as Phaser from 'phaser';
declare type integer = number;

import Point = Phaser.Geom.Point;
import Line = Phaser.Geom.Line;

/**
 * Point with additional helper methods. Decorates existing Phaser Point class.
 */
export class ExtPoint {
    point: Point;

    constructor(p: Point) {
        this.point = p;
    }

    static createWithCoordinates(x: number, y: number): ExtPoint {
        return new ExtPoint(new Point(x, y));
    }

    x(): number { return this.point.x; }
    y(): number { return this.point.y; }

    isLeftOf(p: ExtPoint): boolean { return this.x() < p.x(); }
    isRightOf(p: ExtPoint): boolean { return this.x() > p.x(); }
    isAboveOf(p: ExtPoint): boolean { return this.y() < p.y(); }
    isBelowOf(p: ExtPoint): boolean { return this.y() > p.y(); }
    isLeftAndAboveOf(p: ExtPoint): boolean { return this.isLeftOf(p) && this.isAboveOf(p); }
    isLeftAndBelowOf(p: ExtPoint): boolean { return this.isLeftOf(p) && this.isBelowOf(p); }
    isRightAndAboveOf(p: ExtPoint): boolean { return this.isRightOf(p) && this.isAboveOf(p); }
    isRightAndBelowOf(p: ExtPoint): boolean { return this.isRightOf(p) && this.isBelowOf(p); }
    isOnSameVerticalAxisOf(p: ExtPoint): boolean { return this.point.x === p.x(); }
    isOnSameHorizontalAxisOf(p: ExtPoint): boolean { return this.point.y === p.y(); }
    isBetweenTwoPointsInclusive(p1: ExtPoint, p2: ExtPoint): boolean {
        const line: Line = new Line(p1.x(), p1.y(), p2.x(), p2.y());
        return Phaser.Geom.Intersects.PointToLineSegment(this.point, line);
    }

    isAfter(point: ExtPoint, p1: ExtPoint, p2: ExtPoint): boolean {
        const isGoingRight = p2.x() > p1.x();
        const isGoingDown = p2.y() > p1.y();

        return isGoingRight && this.x() > point.x() ||
               isGoingDown &&  this.y() > point.y();
    }

    equals(p: ExtPoint): boolean {
        return (this.x() === p.x() && this.y() === p.y());
    }

}