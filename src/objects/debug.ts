import * as Phaser from 'phaser';
declare type integer = number;

import QixScene from "../scenes/qix-scene";
import {config, customConfig} from "../main";
import {ExtPoint} from "./ext-point";
import Line = Phaser.Geom.Line;
import * as $ from "jquery";
import Graphics = Phaser.GameObjects.Graphics;
import {ExtRectangle} from "./ext-rectangle";
import Rectangle = Phaser.Geom.Rectangle;
import Point = Phaser.Geom.Point;

export class Debug {

    scene: QixScene;

    debugTextArea$: JQuery;

    graphics1Y = 3 * customConfig.margin + customConfig.frameHeight + customConfig.infoHeight;
    graphics2Y = 4 * customConfig.margin + 2 * customConfig.frameHeight + customConfig.infoHeight;

    frame1: Graphics;
    frame2: Graphics;

    graphics1: Graphics;
    graphics2: Graphics;

    constructor(scene: QixScene) {
        this.scene = scene;

        this.debugTextArea$ = $('#debugTextArea');

        if (customConfig.debug) {
            this.debugTextArea$.width(`${config.width}px`).height(`${customConfig.debugTextAreaHeight}px`);
            this.debugTextArea$.css('font-family', '"Lucida Console", Monaco, monospace');

            this.frame1 = this.createGraphics(this.graphics1Y, true);
            this.graphics1 = this.createGraphics();

            this.frame2 = this.createGraphics(this.graphics2Y, false);
            this.graphics2 = this.createGraphics();
        } else {
            this.debugTextArea$.hide();
        }
    }

    createGraphics(y: integer = 0, withRect: boolean = false): Graphics {
        const graphics: Graphics = this.scene.add.graphics();
        graphics.lineStyle(1, customConfig.lineColor);
        graphics.fillStyle(customConfig.fillColor);

        if (withRect) {
            const rect = new ExtRectangle(new Rectangle(
                customConfig.margin,
                y,
                config.width as number - 2 * customConfig.margin,
                customConfig.frameHeight));

            graphics.strokeRectShape(rect.rectangle);
        }

        return graphics;
    }

    highlightPoints(points: ExtPoint[], radius = 3, fill = true, buffer = 500, destroyTime = 1200, color = 0x33AA55): void {
        if (! customConfig.debug) return;

        const drawPointFunc = ((index: string) => {
            const point = points[parseInt(index)];
            const g = this.scene.add.graphics();
            g.lineStyle(1, color);
            g.fillStyle(color);
            if (fill) {
                g.fillCircle(point.x(), point.y(), radius);
            } else {
                g.strokeCircle(point.x(), point.y(), radius);
            }
            setTimeout(() => { g.destroy(); }, destroyTime);
        });

        for (let i in points) {
            const time = buffer * Number(i);
            setTimeout(() => {
                drawPointFunc(i);
            }, time);
        }
    }

    drawLines(graphics: Graphics, lines: Line[], clearFirst: boolean = true): void {
        if (! customConfig.debug) return;

        if (clearFirst) {
            graphics.clear();
        }

        lines.forEach((line) => { graphics.strokeLineShape(line); });
    }

    drawPoints1(points: ExtPoint[], clearFirst: boolean = true): void {
        if (! customConfig.debug) return;
        this.drawPoints(this.graphics1, points, this.graphics1Y, clearFirst);
    }

    drawPoints2(points: ExtPoint[], clearFirst: boolean = true): void {
        if (! customConfig.debug) return;
        this.drawPoints(this.graphics2, points, this.graphics2Y, clearFirst);
    }

    drawPoints(graphics: Graphics, points: ExtPoint[], y: integer, clearFirst: boolean = true): void {
        if (! customConfig.debug) return;
        if (clearFirst) {
            graphics.clear();
        }

        let pts: Point[] = [];
        points.forEach((point) => {
            let pt: Point = new Point(point.x(), point.y() + y - customConfig.margin);
            pts.push(pt);
        });

        graphics.strokePoints(pts, true);
    }

    infoPoints(text: string, points: ExtPoint[]): void {
        if (! customConfig.debug) return;
        this.table(text, points.map((pt) => pt.point));
    }

    infoLines(text: string, lines: Line[]): void {
        if (! customConfig.debug) return;
        this.table(text, lines);
    }

    info(text: string): void {
        if (! customConfig.debug) return;
        this.debugTextArea$.html(this.debugTextArea$.html() + text + '\n');
        this.infoScroll();
    }

    table(title: string, objects: any[]): void {
        if (! customConfig.debug) return;
        const indent: string = '> ';

        this.info(title);

        if (objects.length === 0) {
            return;
        }

        const keys: string[] = Object.getOwnPropertyNames(objects[0]);

        let header: string = `${indent}idx `;

        let colWidths: integer[] = [];
        for (let ki = 0; ki < keys.length; ki++) { colWidths.push(0); }
        for (let oi = 0; oi < objects.length; oi++) {
            const object = objects[oi];
            for (let ki = 0; ki < keys.length; ki++) {
                const key = keys[ki];
                const length  = object[key].toString().length + 1;
                colWidths[ki] = (colWidths[ki] > length) ? colWidths[ki] : length;
            }
        }

        for (let ki = 0; ki < keys.length; ki++) {
            header += this.pad(keys[ki], colWidths[ki]);
        }
        this.info(header);

        for (let oi = 0; oi < objects.length; oi++) {
            const object = objects[oi];
            let line: string = indent + this.pad(oi.toString(), 4);

            for (let ki = 0; ki < keys.length; ki++) {
                const key = keys[ki];
                line += this.pad(object[key].toString(), colWidths[ki]);
            }

            this.info(line);
        }
    }

    infoScroll(): void {
        if (! customConfig.debug) return;
        this.debugTextArea$.scrollTop((this.debugTextArea$[0].scrollHeight - this.debugTextArea$.height()));
    }

    pad(str: string, length: integer, padChar: string = ' '): string {
        return (str + Array(length).join(padChar)).substring(0, length);
    }
}