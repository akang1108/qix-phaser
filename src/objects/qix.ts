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

    NUM_LINES_MAX: number = 5;
    LINE_DEGREES_INCREMENT: number = 10;
    LINE_LENGTH_MIN: number = 20;
    LINE_LENGTH_MAX: number = 60;

    x: integer;

    y: integer;

    linesGraphics: Graphics[] = [];
    lines: Line[] = [];

    // Current direction of Qix
    directionDegrees: number = 0;

    // Current line being drawn for the Qix
    currentLineLength: number = 100;
    currentLineDegrees: number = 0;
    rotationalPointDistance: number = 40;

    tick: integer = 1;

    tickCount: integer = 0;

    constructor(scene: QixScene, x: integer, y: integer) {
        this.scene = scene;
        this.x = x;
        this.y = y;

        this.speed = customConfig.speed;

        this.redraw();
    }

    update(): void {
        this.redraw();
    }

    destroy(): void {
        this.linesGraphics.forEach((lineGraphic: Graphics) => {
            lineGraphic.destroy();
        });
    }

    redraw(): void {
        if ((this.tickCount + 1) < this.tick) {
            this.tickCount++;
            return;
        }

        this.move();
        this.tickCount = 0;

        const line = this.createNextLine();
        const lineGraphics = this.createNextLineGraphics(line);

        if (this.lines.length === this.NUM_LINES_MAX) {
            this.lines.splice(0, 1);
            this.linesGraphics[0].destroy();
            this.linesGraphics.splice(0, 1);
        }

        this.lines.push(line);
        this.linesGraphics.push(lineGraphics);
    }

    private getRandomDegrees(degrees: number) {
        const MIN_CHANGE_DEG = 45;
        const MAX_CHANGE_DEG = 315;

        let randomDegrees = Math.random() * (MAX_CHANGE_DEG - MIN_CHANGE_DEG) + MIN_CHANGE_DEG;
        randomDegrees = randomDegrees % 360;
        return randomDegrees;
    }

    private move(): void {
        let collision = false;

        do {
            const nextLine = this.getNextLine(this.getPoint(), this.currentLineDegrees, this.rotationalPointDistance, this.currentLineLength);
            const currentLinesCopy = this.lines.map(l => l);
            currentLinesCopy.push(nextLine);
            let collision = this.scene.grid.frame.collisionWithLines(currentLinesCopy);
            if (collision) {
                this.directionDegrees = this.getRandomDegrees(this.directionDegrees);
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

    private createNextLineGraphics(line: Line): Graphics {
        const lineGraphics: Graphics = this.scene.add.graphics();
        lineGraphics.lineStyle(1, customConfig.sparkyColor);
        lineGraphics.fillStyle(customConfig.sparkyColor);
        lineGraphics.strokeLineShape(line);
        return lineGraphics;
    }

    private createNextLine(): Line {
        const line = this.getNextLine(this.getPoint(), this.currentLineDegrees, this.rotationalPointDistance, this.currentLineLength);
        this.currentLineDegrees += this.LINE_DEGREES_INCREMENT;
        return line;
    }

    private getNextLine(point: Point, lineDegrees: number, rotationalPointDistance: number, length: number): Line {
        const tailPoint = GeomUtils.calculatePointFromOrigin(point, 180 + lineDegrees, rotationalPointDistance);
        const headPoint = GeomUtils.calculatePointFromOrigin(point, lineDegrees, length - rotationalPointDistance);

        return new Line(tailPoint.x, tailPoint.y, headPoint.x, headPoint.y);
    }

}
