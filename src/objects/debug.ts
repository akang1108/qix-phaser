import Qix from "../scenes/qix";
import {StringUtils} from "../utils/string-utils";
import {config} from "../main";
import {Grid} from "./grid";

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

        // const isOutOfBounds = this.grid.isOutOfBounds(this.player, this.cursors);
        let lines: string[] = [];

        lines = lines.concat(this.debugGrid(this.qix.grid));
        lines.push(`time: ${Math.round(time)}`);
        // lines.push(`isOutOfBounds: ${isOutOfBounds}`);
        // lines.push(`onExistingGrid: ${this.grid.onExisting(this.player)}`);

        this.qix.info.updateDebugText(lines, delta);
    }

    debugGrid(grid: Grid) {
        const col1 = 10, col2 = 20, col3 = 10, col4 = 20;

        let lines: string[] = [];

        lines.push(
            StringUtils.padRight(`scene:`, col1) +
            StringUtils.padRight(`[${config.width},${config.height}]`, col2) +
            StringUtils.padRight(`frame:`, col3) +
            StringUtils.padRight(`[${grid.frame.x},${grid.frame.y},${grid.frame.width + grid.frame.x},${grid.frame.height + grid.frame.y}]`, col4)
        );

        // let polygonsStr: string = StringUtils.padRight(`polygons:`, col1);
        //
        // polygonsStr += grid.polygons.map((polygon) => {
        //     return `[area:${polygon.percentArea}% pts:` +
        //         polygon.polygon.points.map((point) => {
        //             return `[${point.x},${point.y}]`
        //         }).join(',') +
        //     `] `;
        // }).join(' ');
        //
        // polygonsStr = StringUtils.wrap(polygonsStr, 100);
        //
        // lines.push(
        //     polygonsStr
        // );

        return lines;
    }
}