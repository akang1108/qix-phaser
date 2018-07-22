import Qix from "../scenes/qix";
import {StringUtils} from "../utils/string-utils";
import {config} from "../main";
import {ExtPoint} from "./ext-point";
import Line = Phaser.Geom.Line;

export class Debug {

    static DEBUG = true;

    qix: Qix;

    constructor(qix: Qix) {
        this.qix = qix;
    }

    update(time: number, delta: number) {
        if (! Debug.DEBUG) {
            return
        }

        let lines: string[] = this.debug(this.qix);

        this.qix.info.updateDebugText(lines, delta);
    }

    debug(qix: Qix): string[] {
        const cols = [15, 40, 15, 40];

        const player = qix.player;
        const grid = qix.grid;
        const frame = qix.grid.frame;
        const info = qix.info;

        let data: string[] = [];

        data.push(`scene:`);
        data.push(`w[${config.width}] h[${config.height}]`);
        data.push(`frame:`);
        data.push(`pt[${frame.x()},${frame.y()}]  w[${frame.width()}] h[${frame.height()}]`);
        data.push(`info:`);
        data.push(`pt[${info.x()},${info.y()}]  w[${info.width()}] h[${info.height()}]`);
        data.push(`on existing:`);
        data.push(`${grid.onExistingLine(player)}`);
        data.push(`on frame:`);
        data.push(`${frame.pointOnOutline(player.point().point)}`);
        data.push(`on polygon:`);
        data.push(`${grid.filledPolygons.pointOnLine(player.point())}`);

        return StringUtils.dataToLines(cols, data);
    }

    debugHighlightPoints(points: ExtPoint[], radius = 3, fill = true, buffer = 500, destroyTime = 1200, color = 0x33AA55): void {
        const drawPointFunc = ((index: string) => {
            const point = points[parseInt(index)];
            const g = this.qix.add.graphics();
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

    debugConsolePoints(text: string, points: ExtPoint[]): void {
        console.group();
        console.info(text);
        console.table(points.map((pt) => pt.point));
        console.groupEnd();
    }

    debugConsoleLines(text: string, lines: Line[]): void {
        console.group();
        console.info(text);
        console.table(lines);
        console.groupEnd();
    }
}