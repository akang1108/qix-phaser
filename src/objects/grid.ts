import Graphics = Phaser.GameObjects.Graphics;
import Rectangle = Phaser.Geom.Rectangle;
import {config} from "../main";
import {Player} from "./player";
import {ExtPoint} from "./ext-point";
import Qix from "../scenes/qix";
import {FilledPolygons} from "./filled-polygons";
import {ExtRectangle} from "./ext-rectangle";
import {CurrentLines} from "./current-lines";


export class Grid {
    static FRAME_MARGIN: integer = 10;
    static FRAME_HEIGHT: integer;
    static LINE_COLOR: integer = 0x0000;
    static FILL_COLOR: integer = 0xCCAAFF;
    static FRAME_HEIGHT_PERCENT: number = .7;

    qix: Qix;
    filledPolygons: FilledPolygons;
    currentLines: CurrentLines;

    frameGraphics: Graphics;
    frame: ExtRectangle;
    frameArea: number;

    constructor(qix: Qix) {
        this.qix = qix;
        this.filledPolygons = new FilledPolygons(qix);
        this.currentLines = new CurrentLines(qix);

        Grid.FRAME_HEIGHT = Math.round(config.height as number * Grid.FRAME_HEIGHT_PERCENT);
        this.frameGraphics = qix.add.graphics();
        this.frameGraphics.lineStyle(1, Grid.LINE_COLOR);
        this.frameGraphics.fillStyle(Grid.FILL_COLOR);

        this.frame = new ExtRectangle(new Rectangle(
            Grid.FRAME_MARGIN,
            Grid.FRAME_MARGIN,
            config.width as number - 2 * Grid.FRAME_MARGIN,
            Grid.FRAME_HEIGHT));

        this.frameArea = this.frame.rectangle.height * this.frame.rectangle.width;
        this.frameGraphics.strokeRectShape(this.frame.rectangle);
    }

    update(player: Player) {
        if (! player.moving()) {
            return;
        }

        if (this.movingAlongExistingLine(player)) {
            return;
        }

        if (this.filledPolygons.pointWithinPolygon(player.point())) {
            console.log('within a polygon');
        }

        this.currentLines.updateLine(player);

        this.checkAndUpdateForClosedLoop(player);

        return;
    }

    movingAlongExistingLine(player: Player) {
        const onExisting = this.onExistingLine(player);

        if (onExisting && player.previousOnExisting) {
            this.currentLines.currentPolygonPoints = [];
            this.currentLines.currentLine = null;
            return true;
        } else {
            player.previousOnExisting = onExisting;
            return false;
        }
    }

    checkAndUpdateForClosedLoop(player: Player): boolean {
        const onExistingLine = this.onExistingLine(player);
        return this.checkAndUpdateForClosedLoop2(player, onExistingLine);
    }

    checkAndUpdateForClosedLoop2(player: Player, onExistingLine: boolean): boolean {
        let closedLoop = false;

        if (onExistingLine) {
            closedLoop = true;
            this.currentLines.currentPolygonPoints.push(player.point());
            this.filledPolygons.drawFilledPolygon(this.currentLines.currentPolygonPoints);
        }

        return closedLoop;
    }

    onExistingLine(player: Player): boolean {
        return this.frame.pointOnOutline(player.point().point) || this.filledPolygons.pointOnLine(player.point());
    }

    isIllegalMove(player: Player, cursors: CursorKeys): boolean {
        const newPosition = player.getMove(cursors);
        newPosition.x += Player.RADIUS;
        newPosition.y += Player.RADIUS;

        const outOfBounds =
            (newPosition.x < this.frame.rectangle.x) ||
            (newPosition.x > this.frame.rectangle.x + this.frame.rectangle.width) ||
            (newPosition.y < this.frame.rectangle.y) ||
            (newPosition.y > this.frame.rectangle.y + this.frame.rectangle.height);

        return outOfBounds || this.filledPolygons.pointWithinPolygon(new ExtPoint(newPosition));
    }
}
