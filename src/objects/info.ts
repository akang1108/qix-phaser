import Graphics = Phaser.GameObjects.Graphics;
import Rectangle = Phaser.Geom.Rectangle;
import Text = Phaser.GameObjects.Text;
import {config} from "../main";
import {Grid} from "./Grid";
import Qix from "../scenes/qix";

export class Info {

    static TEXT_COLOR = 0xFFFFFF;
    static TEXT_COLOR_STR= '#FFFFFF';
    static PADDING = 10;
    static DEBUG_UPDATE_FREQUENCY = 300;

    graphics: Graphics;
    rect: Rectangle;
    text: Text;

    scene: Qix;
    debug: boolean;
    debugText: string[];

    sinceLastDebugUpdate: number = Info.DEBUG_UPDATE_FREQUENCY + 1;

    constructor(scene: Qix, debug: boolean) {
        this.scene = scene;
        this.debug = debug;

        this.graphics = scene.add.graphics();
        this.graphics.lineStyle(1, Info.TEXT_COLOR);
        this.graphics.fillStyle(Info.TEXT_COLOR);
        this.rect = new Rectangle(
            Grid.FRAME_MARGIN,
            scene.grid.frame.rectangle.bottom + Grid.FRAME_MARGIN,
            config.width as number - 2*Grid.FRAME_MARGIN,
            config.height as number - scene.grid.frame.rectangle.height - 3*Grid.FRAME_MARGIN);
        this.graphics.strokeRectShape(this.rect);
        this.text = scene.add.text(
            Grid.FRAME_MARGIN + Info.PADDING,
            this.rect.top + Info.PADDING, '',
            {font: '12px Courier', fill: Info.TEXT_COLOR_STR });
    }

    updateDebugText(debugText: string[], delta: number) {
        if (this.sinceLastDebugUpdate < Info.DEBUG_UPDATE_FREQUENCY) {
            this.sinceLastDebugUpdate += delta;
            return;
        }

        this.debugText = debugText;
        this.refresh();
        this.sinceLastDebugUpdate = 0;
    }

    refresh() {
        this.text.setText(this.debugText);
    }

}
