import * as Phaser from 'phaser';
declare type integer = number;

import Graphics = Phaser.GameObjects.Graphics;
import Line = Phaser.Geom.Line;
import {Player} from "./player";
import {ExtPoint} from "./ext-point";
import QixScene from "../scenes/qix-scene";
import {Grid} from "./grid";
import {customConfig} from "../main";


export class CurrentLines {
    scene: QixScene;

    graphics: Graphics;
    points: ExtPoint[] = [];
    lines: Line[] = [];
    line: Line = null;

    constructor(scene: QixScene) {
        this.scene = scene;

        this.graphics = this.scene.add.graphics();
        this.graphics.lineStyle(1, customConfig.lineColor);
        this.graphics.fillStyle(customConfig.fillColor);
    }

    grid(): Grid { return this.scene.grid; }

    reset() {
        this.graphics.clear();
        this.points = [];
        this.lines = [];
        this.line = null;
    }

    updateLine(player: Player) {
        // Create new line
        if (! this.line) {
            this.createCurrentLine(player);
        }
        // Moving along existing line
        else if (this.isHorizontal(this.line) && player.movingLeft()) {
            this.line.x1 = player.x();
        } else if (this.isHorizontal(this.line) && player.movingRight()) {
            this.line.x2 = player.x();
        } else if (this.isVertical(this.line) && player.movingUp()) {
            this.line.y1 = player.y();
        } else if (this.isVertical(this.line) && player.movingDown()) {
            this.line.y2 = player.y();
        }
        // 90 degree turn
        else {
            this.lines.push(this.line);
            this.createCurrentLine(player);
        }

        this.graphics.strokeLineShape(this.line);
    }

    createCurrentLine(player: Player) {
        this.points.push(player.previousPoint);
        this.line = new Line(
            player.previousPoint.x(),
            player.previousPoint.y(),
            player.x(),
            player.y());
    }

    isHorizontal(line: Line): boolean {
        return line.x1 != line.x2 && line.y1 == line.y2;
    }

    isVertical(line: Line): boolean {
        return line.x1 == line.x2 && line.y1 != line.y2;
    }

}
