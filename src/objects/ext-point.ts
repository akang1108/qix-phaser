import Point = Phaser.Geom.Point;

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

    public isLeftOf(p: ExtPoint): boolean { return this.x() < p.x(); }
    isRightOf(p: ExtPoint): boolean { return this.x() > p.x(); }
    isAboveOf(p: ExtPoint): boolean { return this.y() < p.y(); }
    isBelowOf(p: ExtPoint): boolean { return this.y() > p.y(); }
    isLeftAndAboveOf(p: ExtPoint): boolean { return this.isLeftOf(p) && this.isAboveOf(p); }
    isLeftAndBelowOf(p: ExtPoint): boolean { return this.isLeftOf(p) && this.isBelowOf(p); }
    isRightAndAboveOf(p: ExtPoint): boolean { return this.isRightOf(p) && this.isAboveOf(p); }
    isRightAndBelowOf(p: ExtPoint): boolean { return this.isRightOf(p) && this.isBelowOf(p); }
    isOnSameVerticalAxisOf(p: ExtPoint): boolean { return this.point.x === p.x(); }
    isOnSameHorizontalAxisOf(p: ExtPoint): boolean { return this.point.y === p.y(); }
}