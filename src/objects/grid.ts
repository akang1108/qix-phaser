import Graphics = Phaser.GameObjects.Graphics;
import Rectangle = Phaser.Geom.Rectangle;
import {config} from "../main";
import {Player} from "./player";
import {ExtPoint} from "./ext-point";
import Qix from "../scenes/qix";
import {FilledPolygons} from "./filled-polygons";
import {ExtRectangle} from "./ext-rectangle";
import {CurrentLines} from "./current-lines";
import {AllPoints} from "./all-points";

export class Grid {
    static FRAME_MARGIN: integer = 10;
    static FRAME_HEIGHT: integer;
    static LINE_COLOR: integer = 0x000;
    static FILL_COLOR: integer = 0xCCAAFF;
    static FRAME_HEIGHT_PERCENT: number = .7;

    qix: Qix;
    filledPolygons: FilledPolygons;
    currentLines: CurrentLines;
    allPoints: AllPoints;

    frameGraphics: Graphics;
    frame: ExtRectangle;
    frameArea: number;

    constructor(qix: Qix) {
        this.qix = qix;
        this.filledPolygons = new FilledPolygons(qix);
        this.currentLines = new CurrentLines(qix);
        this.createFrame();

        this.allPoints = new AllPoints(this.qix, this.frame.rectangle);
    }

    createFrame(): void {
        Grid.FRAME_HEIGHT = Math.round(config.height as number * Grid.FRAME_HEIGHT_PERCENT);
        this.frameGraphics = this.qix.add.graphics();
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

        this.currentLines.updateLine(player);

        this.checkAndUpdateForClosedLoop(player);

        return;
    }

    movingAlongExistingLine(player: Player) {
        const onExisting = this.onExistingLine(player);

        if (onExisting && player.previousOnExisting) {
            this.currentLines.reset();
            return true;
        } else {
            player.previousOnExisting = onExisting;
            return false;
        }
    }

    checkAndUpdateForClosedLoop(player: Player): boolean {
        const closedLoop = this.onExistingLine(player);

        if (closedLoop) {
            this.currentLines.points.push(player.point());

            const points = this.allPoints.calculateNewPolygonPoints(this.currentLines.points);
            this.filledPolygons.drawFilledPolygon(points);

            this.currentLines.reset();
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
