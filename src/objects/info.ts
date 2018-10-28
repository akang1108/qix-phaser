import * as Phaser from 'phaser';
declare type integer = number;

import Graphics = Phaser.GameObjects.Graphics;
import Rectangle = Phaser.Geom.Rectangle;
import Text = Phaser.GameObjects.Text;
import {config, customConfig} from "../main";
import QixScene from "../scenes/qix-scene";
import {StringUtils} from "../utils/string-utils";

export class Info {
    static OUTLINE_COLOR = 0xFFFFFF;

    static PADDING = 10;
    static PAUSE_BUTTON_WIDTH = 70;
    static TEXT_FONT = '12px Courier';

    static GAME_TEXT_COLOR_STR= '#FFFFFF';

    graphics: Graphics;
    rectangle: Rectangle;

    gameText: Text;
    gameLines: string[];

    pauseButtonText: Text;

    scene: QixScene;

    constructor(scene: QixScene) {

        this.scene = scene;

        this.graphics = scene.add.graphics();
        this.graphics.lineStyle(1, Info.OUTLINE_COLOR);
        this.rectangle = new Rectangle(
            customConfig.margin,
            scene.grid.frame.rectangle.bottom + customConfig.margin,
            config.width as number - 2*customConfig.margin,
            customConfig.infoHeight);
        this.graphics.strokeRectShape(this.rectangle);

        const gameTextOptions = {font: Info.TEXT_FONT, fill: Info.GAME_TEXT_COLOR_STR };
        const gameTextX = customConfig.margin + Info.PADDING;
        const gameTextY = this.rectangle.top + Info.PADDING;
        this.gameText = scene.add.text(gameTextX, gameTextY, '', gameTextOptions);

        const pauseButtonOptions = {font: Info.TEXT_FONT, fill: Info.GAME_TEXT_COLOR_STR };
        this.pauseButtonText = scene.add.text(config.width as number - Info.PAUSE_BUTTON_WIDTH, this.rectangle.top + Info.PADDING, 'Pause', pauseButtonOptions);
        this.pauseButtonText.setInteractive();
        this.pauseButtonText.on('pointerdown', () => {
            this.scene.pauseControl.togglePause();

            this.pauseButtonText.setText((this.pauseButtonText.text === 'Pause') ? 'Unpause' : 'Pause');
        });
    }

    x(): number { return this.rectangle.x; }
    y(): number { return this.rectangle.y; }
    width(): number { return this.rectangle.width; }
    height(): number { return this.rectangle.height; }

    updateGameText() {
        const cols = [15, 15, 15, 15, 15, 30];

        const player = this.scene.player;
        const grid = this.scene.grid;
        const frame = this.scene.grid.frame;
        const filledPolygons = this.scene.grid.filledPolygons;

        let data: string[] = [];

        data.push(`% Filled:`);
        data.push(`${filledPolygons.percentAreaString()}`);
        data.push(`% Target:`);
        data.push(`${this.scene.levels.coverageTarget}`);
        data.push(`Level:`);
        data.push(`${this.scene.levels.currentLevel}`);

        this.gameLines = StringUtils.dataToLines(cols, data);
        this.gameText.setText(this.gameLines);
    }

}
