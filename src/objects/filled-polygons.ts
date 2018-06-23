import Graphics = Phaser.GameObjects.Graphics;
import Rectangle = Phaser.Geom.Rectangle;
import Point = Phaser.Geom.Point;
import {Player} from "./player";
import {ExtPoint} from "./ext-point";
import {ExtPolygon} from "./ext-polygon";
import Qix from "../scenes/qix";
import {Grid} from "./grid";


export class FilledPolygons {
    static LINE_COLOR: integer = 0x0000;
    static FILL_COLOR: integer = 0xCCAAFF;

    qix: Qix;
    polygons: ExtPolygon[] = [];
    graphics: Graphics;

    constructor(qix: Qix) {
        this.qix = qix;

        this.graphics = qix.add.graphics();
        this.graphics.lineStyle(1, FilledPolygons.LINE_COLOR);
        this.graphics.fillStyle(FilledPolygons.FILL_COLOR);
    }

    grid(): Grid { return this.qix.grid; }
    frame(): Rectangle { return this.qix.grid.frame; }
    frameArea(): number { return this.qix.grid.frameArea; }

    /**
     * Based on frame and existing polygon lines, need to fill out rest of the polygon points
     *
     * @param {ExtPoint[]} points
     */
    drawFilledPolygon(points: ExtPoint[]) {
        let polygonPoints: Point[] = points.map((p) => p.point);

        const firstPoint = points[0];
        const lastPoint = points[points.length - 1];

        if (this.onFramePoint(firstPoint) && this.onFramePoint(lastPoint)) {
            if (firstPoint.isLeftOf(lastPoint) && this.onLeftSideOfRectangle(firstPoint, this.frame())) {
                polygonPoints.push(new Point(firstPoint.x(), lastPoint.y()));
            }
            else if (firstPoint.isRightOf(lastPoint) && this.onLeftSideOfRectangle(lastPoint, this.frame())) {
                polygonPoints.push(new Point(lastPoint.x(), firstPoint.y()));
            }
            else if (firstPoint.isLeftOf(lastPoint) && this.onRightSideOfRectangle(lastPoint, this.frame())) {
                polygonPoints.push(new Point(lastPoint.x(), firstPoint.y()));
            }
            else if (firstPoint.isRightOf(lastPoint) && this.onRightSideOfRectangle(firstPoint, this.frame())) {
                polygonPoints.push(new Point(firstPoint.x(), lastPoint.y()));
            }
        }

        const polygon: ExtPolygon = new ExtPolygon(polygonPoints, this.frameArea());
        polygon.draw(this);
        this.polygons.push(polygon);
        //this.logPolygons();
    }

    logPolygons(): void {
        console.table(
            this.polygons.map((polygon) => {
                let obj: any = {};
                obj.percentArea = `${polygon.percentArea}%`;
                polygon.polygon.points.forEach((point, index) => {
                    obj[`pt${index}`] = `${point.x},${point.y}`;
                });
                return obj;
            })
        );
    }

    onFramePoint(point: ExtPoint): boolean {
        const onFrame =
            this.onTopSideOfRectangle(point, this.frame()) ||
            this.onRightSideOfRectangle(point, this.frame()) ||
            this.onBottomSideOfRectangle(point, this.frame()) ||
            this.onLeftSideOfRectangle(point, this.frame());

        return onFrame;
    }

    onPolygonLinePoint(point: ExtPoint): boolean {
        for (let i = 0; i < this.polygons.length; i++) {
            if (this.polygons[i].outlineIntersects(point)) {
                return true;
            }
        }

        return false;
    }

    withinAPolygon(point: ExtPoint): boolean {
        for (let i = 0; i < this.polygons.length; i++) {
            if (this.polygons[i].innerIntersects(point)) {
                return true;
            }
        }

        return false;
    }

    onTopSideOfRectangle(point: ExtPoint, rectangle:Rectangle) { return Phaser.Geom.Intersects.PointToLine(point.point, rectangle.getLineA()) }
    onRightSideOfRectangle(point: ExtPoint, rectangle:Rectangle) { return Phaser.Geom.Intersects.PointToLine(point.point, rectangle.getLineB()) }
    onBottomSideOfRectangle(point: ExtPoint, rectangle:Rectangle) { return Phaser.Geom.Intersects.PointToLine(point.point, rectangle.getLineC()) }
    onLeftSideOfRectangle(point: ExtPoint, rectangle:Rectangle) { return Phaser.Geom.Intersects.PointToLine(point.point, rectangle.getLineD()) }

    isIllegalMove(player: Player, cursors: CursorKeys): boolean {
        const newPosition = player.getMove(cursors);
        newPosition.x += Player.RADIUS;
        newPosition.y += Player.RADIUS;

        const outOfBounds =
            (newPosition.x < this.frame.x) ||
            (newPosition.x > this.frame.x + this.frame.width) ||
            (newPosition.y < this.frame.y) ||
            (newPosition.y > this.frame.y + this.frame.height);

        return outOfBounds || this.withinAPolygon(new ExtPoint(newPosition));
    }

}
