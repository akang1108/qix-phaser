import Qix from "../scenes/qix";
import {StringUtils} from "../utils/string-utils";
import {config} from "../main";

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
}