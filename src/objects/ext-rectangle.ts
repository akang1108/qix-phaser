import * as Phaser from 'phaser';
declare type integer = number;

import Rectangle = Phaser.Geom.Rectangle;
import Point = Phaser.Geom.Point;
import Line = Phaser.Geom.Line;
import {GeomUtils} from "../utils/geom-utils";

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
        return Phaser.Geom.Intersects.PointToLineSegment(point, this.rectangle.getLineA())
    }

    pointOnRightSide(point: Point): boolean {
        return Phaser.Geom.Intersects.PointToLineSegment(point, this.rectangle.getLineB())
    }

    pointOnBottomSide(point: Point): boolean {
        return Phaser.Geom.Intersects.PointToLineSegment(point, this.rectangle.getLineC())
    }

    pointOnLeftSide(point: Point): boolean {
        return Phaser.Geom.Intersects.PointToLineSegment(point, this.rectangle.getLineD())
    }

    pointOnOutline(point: Point): boolean {
        return this.pointOnTopSide(point) ||
            this.pointOnRightSide(point) ||
            this.pointOnBottomSide(point) ||
            this.pointOnLeftSide(point);
    }

    getLines(): Line[] {
        return [
            this.rectangle.getLineA(),
            this.rectangle.getLineB(),
            this.rectangle.getLineC(),
            this.rectangle.getLineD() ];
    }

    collisionWithLines(lines: Line[]): boolean {
        let collision = false;

        for (let line of lines) {
            collision = this.collisionWithLine(line);
            if (collision) break;
        }

        return collision;
    }

    collisionWithLine(line: Line): boolean {
        let collision = false;
        // let debug = `[${GeomUtils.lineToString(line)}] `;

        for (let l of this.getLines()) {
            // debug += `${GeomUtils.lineToString(l)} `;
            collision = GeomUtils.collisionLineSegments(l, line);
            if (collision) {
                console.info(`collision! ${GeomUtils.lineToString(line)} collision with ${GeomUtils.lineToString(l)}`);
                break;
            }
        }

        this.getLines().forEach((l: Line) => {
        });





        return collision;
    }
}