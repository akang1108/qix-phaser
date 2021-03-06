import * as Phaser from 'phaser';
declare type integer = number;

import Graphics = Phaser.GameObjects.Graphics;
import Point = Phaser.Geom.Point;
import {ExtPoint} from "./ext-point";
import {ExtPolygon} from "./ext-polygon";
import QixScene from "../scenes/qix-scene";
import {Grid} from "./grid";
import {ExtRectangle} from "./ext-rectangle";

export class FilledPolygons {
    static LINE_COLOR: integer = 0x0000;
    static FILL_COLOR: integer = 0xCCAAFF;

    scene: QixScene;
    polygons: ExtPolygon[] = [];
    graphics: Graphics;

    constructor(scene: QixScene) {
        this.scene = scene;

        this.graphics = scene.add.graphics();
        this.graphics.lineStyle(1, FilledPolygons.LINE_COLOR);
        this.graphics.fillStyle(FilledPolygons.FILL_COLOR);
    }

    grid(): Grid { return this.scene.grid; }
    frame(): ExtRectangle { return this.scene.grid.frame; }
    frameArea(): number { return this.scene.grid.frameArea; }

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
