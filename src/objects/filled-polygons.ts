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

    percentArea(): number {
        return this.polygons.reduce((total, currentPolygon) => {
            return total + currentPolygon.percentArea;
        }, 0);
    }

    percentAreaString(): string {
        return this.percentArea().toFixed(1);
    }

    /**
     * Based on frame and existing polygon lines, need to fill out rest of the polygon points
     *
     * @param {ExtPoint[]} points
     */
    drawFilledPolygon(points: ExtPoint[]) {
        let polygonPoints: Point[] = points.map((p) => p.point);

        const polygon: ExtPolygon = new ExtPolygon(polygonPoints, this.frameArea());
        polygon.draw(this);
        this.polygons.push(polygon);
    }

    logPolygons(): void {
        console.table(
            this.polygons.map((polygon) => {
                let obj: any = {};
                obj.percentAreaString = `${polygon.percentAreaString}%`;
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
