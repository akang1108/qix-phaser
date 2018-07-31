import Graphics = Phaser.GameObjects.Graphics;
import Rectangle = Phaser.Geom.Rectangle;
import Text = Phaser.GameObjects.Text;
import {config, customConfig} from "../main";
import Qix from "../scenes/qix";
import {StringUtils} from "../utils/string-utils";

export class Info {
    static OUTLINE_COLOR = 0xFFFFFF;

    static PADDING = 10;
    static TEXT_FONT = '12px Courier';

    static GAME_TEXT_COLOR_STR= '#FFFFFF';

    graphics: Graphics;
    rectangle: Rectangle;

    gameText: Text;
    gameLines: string[];

    qix: Qix;

    constructor(qix: Qix) {
        this.qix = qix;

        this.graphics = qix.add.graphics();
        this.graphics.lineStyle(1, Info.OUTLINE_COLOR);
        this.rectangle = new Rectangle(
            customConfig.margin,
            qix.grid.frame.rectangle.bottom + customConfig.margin,
            config.width as number - 2*customConfig.margin,
            customConfig.infoHeight);
        this.graphics.strokeRectShape(this.rectangle);

        const gameTextOptions = {font: Info.TEXT_FONT, fill: Info.GAME_TEXT_COLOR_STR };
        const gameTextX = customConfig.margin + Info.PADDING;
        const gameTextY = this.rectangle.top + Info.PADDING;
        this.gameText = qix.add.text(gameTextX, gameTextY, '', gameTextOptions);
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
        data.push(`yo`);
        data.push(`hey`);

        this.gameLines = StringUtils.dataToLines(cols, data);
        this.gameText.setText(this.gameLines);
    }

}
