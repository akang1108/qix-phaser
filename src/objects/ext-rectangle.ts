import Rectangle = Phaser.Geom.Rectangle;
import Point = Phaser.Geom.Point;

/**
 * Rectangle decorator
 */
export class ExtRectangle {
    rectangle: Rectangle;

    constructor(r: Rectangle) {
        this.rectangle = r;
    }

    x(): number { return this.rectangle.x; }
    y(): number { return this.rectangle.y; }
    width(): number { return this.rectangle.width; }
    height(): number { return this.rectangle.height; }

    pointOnTopSide(point: Point): boolean {
        return Phaser.Geom.Intersects.PointToLine(point, this.rectangle.getLineA())
    }

    pointOnRightSide(point: Point): boolean {
        return Phaser.Geom.Intersects.PointToLine(point, this.rectangle.getLineB())
    }

    pointOnBottomSide(point: Point): boolean {
        return Phaser.Geom.Intersects.PointToLine(point, this.rectangle.getLineC())
    }

    pointOnLeftSide(point: Point): boolean {
        return Phaser.Geom.Intersects.PointToLine(point, this.rectangle.getLineD())
    }

    pointOnOutline(point: Point): boolean {
        return this.pointOnTopSide(point) ||
            this.pointOnRightSide(point) ||
            this.pointOnBottomSide(point) ||
            this.pointOnLeftSide(point);
    }
}