import * as Phaser from 'phaser';
declare type integer = number;

import Graphics = Phaser.GameObjects.Graphics;
import Point = Phaser.Geom.Point;
import Line = Phaser.Geom.Line;
import Set = Phaser.Structs.Set;
import {ExtPoint} from "./ext-point";
import {customConfig} from "../main";
import QixScene from "../scenes/qix-scene";
import {Direction} from "./direction";
import {ExtPolygon} from "./ext-polygon";
import {GeomUtils} from "../utils/geom-utils";

export class Qix {

    scene: QixScene;

    speed: integer;

    static NUM_LINES_MAX: number = 6;
    static LINE_LENGTH_MIN: number = 20;
    static LINE_LENGTH_MAX: number = 60;
    static MIN_CHANGE_DEG = 135;
    static MAX_CHANGE_DEG = 225;

    lineDegreesIncrement: number = 4;

    x: integer;

    y: integer;

    linesGraphics: Graphics[] = [];
    lines: Line[] = [];

    // Current direction of Qix
    directionDegrees: number = 0;

    // Current line being drawn for the Qix
    currentLineLength: number = 100;
    currentLineDegrees: number = 0;
    rotationalPointDistance: number = 50;

    tick: integer = 2;

    tickCount: integer = 0;

    constructor(scene: QixScene, x: integer, y: integer) {
        this.scene = scene;
        this.x = x;
        this.y = y;

        // this.speed = customConfig.speed;
        this.speed = 20;

        this.draw();
    }

    update(): void {
        this.moveAndDraw();
    }

    destroy(): void {
        this.linesGraphics.forEach((lineGraphic: Graphics) => {
            lineGraphic.destroy();
        });
    }

    private moveAndDraw(): void {
        if ((this.tickCount + 1) < this.tick) {
            this.tickCount++;
            return;
        }

        this.tickCount = 0;

        this.move();
        this.draw();
    }

    private draw(): void {
        const line = this.createNextLine();
        const lineGraphics = this.createNextLineGraphics(line);

        if (this.lines.length === Qix.NUM_LINES_MAX) {
            this.lines.splice(0, 1);
            this.linesGraphics[0].destroy();
            this.linesGraphics.splice(0, 1);
        }

        this.lines.push(line);
        this.linesGraphics.push(lineGraphics);
    }

    private getRandomDegrees(degrees: number) {
        let randomDegrees = Math.random() * (Qix.MAX_CHANGE_DEG - Qix.MIN_CHANGE_DEG) + Qix.MIN_CHANGE_DEG + degrees;
        randomDegrees = randomDegrees % 360;
        return randomDegrees;
    }

    private move(): void {
        let collision: boolean = false;
        let count: number = 0;
        let firstCollisionProcessed: boolean = false;
        let secondCollisionProcessed: boolean = false;
        let originalLineDegrees: number = this.currentLineDegrees;

        do {
            count++;

            if (count > 360) {
                console.info('Houston we have a problem - not sure how to make the qix move again...');
                this.scene.pauseControl.pause();
                break;
            }

            const nextPoint = GeomUtils.calculatePointFromOrigin(this.getPoint(), this.directionDegrees, this.speed);
            const nextLine = this.getNextLine(nextPoint, this.currentLineDegrees, this.rotationalPointDistance, this.currentLineLength);

            collision = this.scene.grid.frame.collisionWithLine(nextLine) || this.scene.grid.frame.nonInteresectingLineOutside(nextLine) ||
                this.scene.grid.filledPolygons.pointWithinPolygon(new ExtPoint(new Point(nextLine.x1, nextLine.y1))) ||
                this.scene.grid.filledPolygons.pointWithinPolygon(new ExtPoint(new Point(nextLine.x2, nextLine.y2)));

            if (collision) {
                if (secondCollisionProcessed) {
                    this.directionDegrees += 1;
                    this.directionDegrees = this.directionDegrees % 360;
                } else if (firstCollisionProcessed && ! secondCollisionProcessed) {
                    this.directionDegrees = (originalLineDegrees + Qix.MIN_CHANGE_DEG) % 360;
                    secondCollisionProcessed = true;
                } else {
                    this.directionDegrees = this.getRandomDegrees(this.directionDegrees);
                }

                if (! firstCollisionProcessed) {
                    this.currentLineDegrees -= (this.lineDegreesIncrement * 2);
                    this.lineDegreesIncrement = -this.lineDegreesIncrement;
                    firstCollisionProcessed = true;
                }
            }
        } while (collision);

        const newPoint = GeomUtils.calculatePointFromOrigin(this.getPoint(), this.directionDegrees, this.speed);

        this.x = newPoint.x;
        this.y = newPoint.y;
    }

    getPoint(): Point {
        return new Point(this.x, this.y);
    }

    getExtPoint(): ExtPoint {
        return new ExtPoint(this.getPoint());
    }

    checkForCollisionWithCurrentLines(): boolean {
        return GeomUtils.collisionLineSegmentArrays(this.lines, this.scene.grid.currentLines.lines) ||
            (this.scene.grid.currentLines.line != null && GeomUtils.collisionLineSegmentArrays(this.lines, [ this.scene.grid.currentLines.line ]));
    }

    private createNextLineGraphics(line: Line): Graphics {
        const lineGraphics: Graphics = this.scene.add.graphics();
        lineGraphics.lineStyle(1, customConfig.sparkyColor);
        lineGraphics.fillStyle(customConfig.sparkyColor);
        lineGraphics.strokeLineShape(line);
        return lineGraphics;
    }

    private createNextLine(): Line {
        const line = this.getNextLine(this.getPoint(), this.currentLineDegrees, this.rotationalPointDistance, this.currentLineLength);
        this.currentLineDegrees = (this.currentLineDegrees + this.lineDegreesIncrement) % 360;
        return line;
    }

    private getNextLine(point: Point, lineDegrees: number, rotationalPointDistance: number, length: number): Line {
        const tailPoint = GeomUtils.calculatePointFromOrigin(point, 180 + lineDegrees, rotationalPointDistance);
        const headPoint = GeomUtils.calculatePointFromOrigin(point, lineDegrees, length - rotationalPointDistance);

        return new Line(tailPoint.x, tailPoint.y, headPoint.x, headPoint.y);
    }

}
