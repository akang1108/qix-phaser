import Graphics = Phaser.GameObjects.Graphics;
import Rectangle = Phaser.Geom.Rectangle;
import Line = Phaser.Geom.Line;
import {config} from "../main";
import {Player} from "./player";
import {ExtPoint} from "./ext-point";
import Qix from "../scenes/qix";
import {FilledPolygons} from "./filled-polygons";


export class Grid {
    static FRAME_MARGIN: integer = 10;
    static FRAME_HEIGHT: integer;
    static LINE_COLOR: integer = 0x0000;
    static FILL_COLOR: integer = 0xCCAAFF;
    static FRAME_HEIGHT_PERCENT: number = .7;

    qix: Qix;
    filledPolygons: FilledPolygons;

    frameGraphics: Graphics;
    lineGraphics: Graphics;

    frame: Rectangle;
    frameArea: number;

    currentPolygonPoints: ExtPoint[] = [];
    currentLines: Line[] = [];
    currentLine: Line;

    constructor(qix: Qix) {
        this.qix = qix;
        this.filledPolygons = new FilledPolygons(qix);

        Grid.FRAME_HEIGHT = Math.round(config.height as number * Grid.FRAME_HEIGHT_PERCENT);
        this.frameGraphics = qix.add.graphics();
        this.frameGraphics.lineStyle(1, Grid.LINE_COLOR);
        this.frameGraphics.fillStyle(Grid.FILL_COLOR);

        this.lineGraphics = qix.add.graphics();
        this.lineGraphics.lineStyle(1, Grid.LINE_COLOR);
        this.lineGraphics.fillStyle(Grid.FILL_COLOR);

        this.frame = new Rectangle(
            Grid.FRAME_MARGIN,
            Grid.FRAME_MARGIN,
            config.width as number - 2 * Grid.FRAME_MARGIN,
            Grid.FRAME_HEIGHT);
        this.frameArea = this.frame.height * this.frame.width;

        this.lineGraphics.strokeRectShape(this.frame);
    }

    update(player: Player) {
        if (! player.moving()) {
            return;
        }

        if (this.movingAlongExistingLine(player)) {
            return;
        }

        if (this.filledPolygons.withinAPolygon(player.point())) {
            console.log('within a polygon');
        }

        this.updateLine(player);

        this.checkAndUpdateForClosedLoop(player);

        return;
    }

    movingAlongExistingLine(player: Player) {
        const onExisting = this.onExistingLine(player);

        if (onExisting && player.previousOnExisting) {
            this.currentPolygonPoints = [];
            this.currentLine = null;
            return true;
        } else {
            player.previousOnExisting = onExisting;
            return false;
        }
    }

    updateLine(player: Player) {
        // Create new line
        if (! this.currentLine) {
            this.createCurrentLine(player);
        }
        // Moving along existing line
        else if (this.isHorizontal(this.currentLine) && player.movingLeft()) {
            this.currentLine.x1 = player.x();
        } else if (this.isHorizontal(this.currentLine) && player.movingRight()) {
            this.currentLine.x2 = player.x();
        } else if (this.isVertical(this.currentLine) && player.movingUp()) {
            this.currentLine.y1 = player.y();
        } else if (this.isVertical(this.currentLine) && player.movingDown()) {
            this.currentLine.y2 = player.y();
        }
        // Switching directions
        else {
            this.currentLines.push(this.currentLine);
            this.createCurrentLine(player);
        }

        this.frameGraphics.strokeLineShape(this.currentLine);
    }

    checkAndUpdateForClosedLoop(player: Player): boolean {
        const onExistingLine = this.onExistingLine(player);
        return this.checkAndUpdateForClosedLoop2(player, onExistingLine);
    }

    checkAndUpdateForClosedLoop2(player: Player, onExistingLine: boolean): boolean {
        let closedLoop = false;

        if (onExistingLine) {
            closedLoop = true;
            this.currentPolygonPoints.push(player.point());
            this.filledPolygons.drawFilledPolygon(this.currentPolygonPoints);
        }

        return closedLoop;
    }

    createCurrentLine(player: Player) {
        this.currentPolygonPoints.push(player.previousPoint);
        this.currentLine = new Line(
            player.previousPoint.x(),
            player.previousPoint.y(),
            player.x(),
            player.y());
    }

    isHorizontal(line: Line): boolean {
        return line.x1 != line.x2 && line.y1 == line.y2;
    }

    isVertical(line: Line): boolean {
        return line.x1 == line.x2 && line.y1 != line.y2;
    }

    onExistingLine(player: Player): boolean {
        return this.onFramePoint(player.point()) || this.filledPolygons.onPolygonLinePoint(player.point());
    }

    onFramePoint(point: ExtPoint): boolean {
        const onFrame =
            this.onTopSideOfRectangle(point, this.frame) ||
            this.onRightSideOfRectangle(point, this.frame) ||
            this.onBottomSideOfRectangle(point, this.frame) ||
            this.onLeftSideOfRectangle(point, this.frame);

        return onFrame;
    }

    onTopSideOfRectangle(point: ExtPoint, rectangle:Rectangle) { return Phaser.Geom.Intersects.PointToLine(point.point, rectangle.getLineA()) }
    onRightSideOfRectangle(point: ExtPoint, rectangle:Rectangle) { return Phaser.Geom.Intersects.PointToLine(point.point, rectangle.getLineB()) }
    onBottomSideOfRectangle(point: ExtPoint, rectangle:Rectangle) { return Phaser.Geom.Intersects.PointToLine(point.point, rectangle.getLineC()) }
    onLeftSideOfRectangle(point: ExtPoint, rectangle:Rectangle) { return Phaser.Geom.Intersects.PointToLine(point.point, rectangle.getLineD()) }

    isIllegalMove(player: Player, cursors: CursorKeys): boolean {
        const newPosition = player.getMove(cursors);
        newPosition.x += Player.RADIUS;
        newPosition.y += Player.RADIUS;

        const outOfBounds =
            (newPosition.x < this.frame.x) ||
            (newPosition.x > this.frame.x + this.frame.width) ||
            (newPosition.y < this.frame.y) ||
            (newPosition.y > this.frame.y + this.frame.height);

        return outOfBounds || this.filledPolygons.withinAPolygon(new ExtPoint(newPosition));
    }

}
