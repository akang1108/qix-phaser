import Graphics = Phaser.GameObjects.Graphics;
import Rectangle = Phaser.Geom.Rectangle;
import Text = Phaser.GameObjects.Text;
import {config} from "../main";
import {Grid} from "./Grid";
import Qix from "../scenes/qix";
import {StringUtils} from "../utils/string-utils";

export class Info {
    static OUTLINE_COLOR = 0xFFFFFF;

    static PADDING = 10;
    static TEXT_FONT = '12px Courier';

    static GAME_TEXT_COLOR_STR= '#FFFFFF';

    static DEBUG_TEXT_COLOR_STR= '#BBBBBB';
    static DEBUG_UPDATE_FREQUENCY = 300;
    static DEBUG_Y_INCREMENT = 60;

    graphics: Graphics;
    rectangle: Rectangle;

    gameText: Text;
    gameLines: string[];

    debug: boolean;
    debugText: Text;
    debugLines: string[];

    qix: Qix;

    sinceLastDebugUpdate: number = Info.DEBUG_UPDATE_FREQUENCY + 1;

    constructor(qix: Qix, debug: boolean) {
        this.qix = qix;
        this.debug = debug;

        this.graphics = qix.add.graphics();
        this.graphics.lineStyle(1, Info.OUTLINE_COLOR);
        this.rectangle = new Rectangle(
            Grid.FRAME_MARGIN,
            qix.grid.frame.rectangle.bottom + Grid.FRAME_MARGIN,
            config.width as number - 2*Grid.FRAME_MARGIN,
            config.height as number - qix.grid.frame.rectangle.height - 3*Grid.FRAME_MARGIN);
        this.graphics.strokeRectShape(this.rectangle);

        const gameTextOptions = {font: Info.TEXT_FONT, fill: Info.GAME_TEXT_COLOR_STR };
        const gameTextX = Grid.FRAME_MARGIN + Info.PADDING;
        const gameTextY = this.rectangle.top + Info.PADDING;
        this.gameText = qix.add.text(gameTextX, gameTextY, '', gameTextOptions);

        const debugTextOptions = {font: Info.TEXT_FONT, fill: Info.DEBUG_TEXT_COLOR_STR };
        const debugTextX = Grid.FRAME_MARGIN + Info.PADDING;
        const debugTextY = this.rectangle.top + Info.PADDING + Info.DEBUG_Y_INCREMENT;
        this.debugText = qix.add.text(debugTextX, debugTextY, '', debugTextOptions);
    }

    x(): number { return this.rectangle.x; }
    y(): number { return this.rectangle.y; }
    width(): number { return this.rectangle.width; }
    height(): number { return this.rectangle.height; }

    updateGameText() {
        const cols = [15, 40, 15, 40];

        const player = this.qix.player;
        const grid = this.qix.grid;
        const frame = this.qix.grid.frame;
        const filledPolygons = this.qix.grid.filledPolygons;

        let data: string[] = [];

        data.push(`% filled:`);
        data.push(`${filledPolygons.percentAreaString()}`);

        this.gameLines = StringUtils.dataToLines(cols, data);
        this.gameText.setText(this.gameLines);
    }

    updateDebugText(debugLines: string[], delta: number) {
        if (this.sinceLastDebugUpdate < Info.DEBUG_UPDATE_FREQUENCY) {
            this.sinceLastDebugUpdate += delta;
            return;
        }

        this.debugLines = debugLines;
        this.debugText.setText(this.debugLines);
        this.sinceLastDebugUpdate = 0;
    }

}
