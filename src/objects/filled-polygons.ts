import Graphics = Phaser.GameObjects.Graphics;
import Point = Phaser.Geom.Point;
import {ExtPoint} from "./ext-point";
import {ExtPolygon} from "./ext-polygon";
import Qix from "../scenes/qix";
import {Grid} from "./grid";
import {ExtRectangle} from "./ext-rectangle";

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
    frame(): ExtRectangle { return this.qix.grid.frame; }
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

        if (this.frame().pointOnOutline(firstPoint.point) && this.frame().pointOnOutline(lastPoint.point)) {
            if (firstPoint.isLeftOf(lastPoint) && this.frame().pointOnLeftSide(firstPoint.point)) {
                polygonPoints.push(new Point(firstPoint.x(), lastPoint.y()));
            }
            else if (firstPoint.isRightOf(lastPoint) && this.frame().pointOnLeftSide(lastPoint.point)) {
                polygonPoints.push(new Point(lastPoint.x(), firstPoint.y()));
            }
            else if (firstPoint.isLeftOf(lastPoint) && this.frame().pointOnRightSide(lastPoint.point)) {
                polygonPoints.push(new Point(lastPoint.x(), firstPoint.y()));
            }
            else if (firstPoint.isRightOf(lastPoint) && this.frame().pointOnRightSide(firstPoint.point)) {
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

    pointOnLine(point: ExtPoint): boolean {
        for (let i = 0; i < this.polygons.length; i++) {
            if (this.polygons[i].outlineIntersects(point)) {
                return true;
            }
        }

        return false;
    }

    pointWithinPolygon(point: ExtPoint): boolean {
        for (let i = 0; i < this.polygons.length; i++) {
            if (this.polygons[i].innerIntersects(point)) {
                return true;
            }
        }

        return false;
    }

}
