import Graphics = Phaser.GameObjects.Graphics;
import Rectangle = Phaser.Geom.Rectangle;
import Line = Phaser.Geom.Line;
import Point = Phaser.Geom.Point;
import {config} from "../main";
import {Player} from "./player";
import {ExtPoint} from "./ext-point";
import {ExtPolygon} from "./ext-polygon";
import {StringUtils} from "../utils/string-utils";
import Qix from "../scenes/qix";


export class Grid {
    static FRAME_MARGIN: integer = 10;
    static FRAME_HEIGHT: integer;
    static LINE_COLOR: integer = 0x0000;
    static FILL_COLOR: integer = 0xCCAAFF;
    static FRAME_HEIGHT_PERCENT: number = .7;

    scene: Qix;

    graphics: Graphics;
    lineGraphics: Graphics;

    frame: Rectangle;
    frameArea: number;
    polygons: ExtPolygon[] = [];

    currentPolygonPoints: ExtPoint[] = [];
    currentLines: Line[] = [];
    currentLine: Line;

    constructor(scene: Qix) {
        this.scene = scene;
        Grid.FRAME_HEIGHT = Math.round(config.height as number * Grid.FRAME_HEIGHT_PERCENT);

        this.graphics = scene.add.graphics();
        this.graphics.lineStyle(1, Grid.LINE_COLOR);
        this.graphics.fillStyle(Grid.FILL_COLOR);

        this.lineGraphics = scene.add.graphics();
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

        if (this.withinAPolygon(player.point())) {
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

        this.graphics.strokeLineShape(this.currentLine);
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
            this.drawFilledPolygon(this.currentPolygonPoints);
        }

        return closedLoop;
    }

    /**
     * Based on frame and existing polygon lines, need to fill out rest of the polygon points
     *
     * @param {ExtPoint[]} points
     */
    drawFilledPolygon(points: ExtPoint[]) {
        let polygonPoints: Point[] = points.map((p) => p.point);

        const firstPoint = points[0];
        const lastPoint = points[points.length - 1];

        if (this.onFramePoint(firstPoint) && this.onFramePoint(lastPoint)) {
            if (firstPoint.isLeftOf(lastPoint) && this.onLeftSideOfRectangle(firstPoint, this.frame)) {
                polygonPoints.push(new Point(firstPoint.x(), lastPoint.y()));
            }
            else if (firstPoint.isRightOf(lastPoint) && this.onLeftSideOfRectangle(lastPoint, this.frame)) {
                polygonPoints.push(new Point(lastPoint.x(), firstPoint.y()));
            }
            else if (firstPoint.isLeftOf(lastPoint) && this.onRightSideOfRectangle(lastPoint, this.frame)) {
                polygonPoints.push(new Point(lastPoint.x(), firstPoint.y()));
            }
            else if (firstPoint.isRightOf(lastPoint) && this.onRightSideOfRectangle(firstPoint, this.frame)) {
                polygonPoints.push(new Point(firstPoint.x(), lastPoint.y()));
            }
        }

        const polygon: ExtPolygon = new ExtPolygon(polygonPoints, this.frameArea);
        polygon.draw(this);
        this.polygons.push(polygon);
        //this.logPolygons();
    }

    logPolygons(): void {
        console.table(
            this.polygons.map((polygon) => {
                let obj: any = {};
                obj.percentArea = `${polygon.percentArea}%`;
                polygon.polygon.points.forEach((point, index) => {
                    obj[`pt${index}`] = `${point.x},${point.y}`;
                });
                return obj;
            })
        );
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
        return this.onFramePoint(player.point()) || this.onPolygonLinePoint(player.point());
    }

    onFramePoint(point: ExtPoint): boolean {
        const onFrame =
            this.onTopSideOfRectangle(point, this.frame) ||
            this.onRightSideOfRectangle(point, this.frame) ||
            this.onBottomSideOfRectangle(point, this.frame) ||
            this.onLeftSideOfRectangle(point, this.frame);

        return onFrame;
    }

    onPolygonLinePoint(point: ExtPoint): boolean {
        for (let i = 0; i < this.polygons.length; i++) {
            if (this.polygons[i].outlineIntersects(point)) {
                return true;
            }
        }

        return false;
    }

    withinAPolygon(point: ExtPoint): boolean {
        for (let i = 0; i < this.polygons.length; i++) {
            if (this.polygons[i].innerIntersects(point)) {
                return true;
            }
        }

        return false;
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

        return outOfBounds || this.withinAPolygon(new ExtPoint(newPosition));
    }

    debug(): string[] {
        const col1 = 10, col2 = 20, col3 = 10, col4 = 20;

        let lines: string[] = [];

        lines.push(
            StringUtils.padRight(`scene:`, col1) +
                StringUtils.padRight(`[${config.width},${config.height}]`, col2) +
                StringUtils.padRight(`frame:`, col3) +
                StringUtils.padRight(`[${this.frame.x},${this.frame.y},${this.frame.width + this.frame.x},${this.frame.height + this.frame.y}]`, col4)
        );

        // let polygonsStr: string = StringUtils.padRight(`polygons:`, col1);
        //
        // polygonsStr += this.polygons.map((polygon) => {
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



    /*
    graphics: Graphics;
    lineGraphics: Graphics;

    frame: Rectangle;
    polygons: PolygonWithOutline[] = [];

    allPoints: ExtPoint[] = [];

    currentPolygonPoints: ExtPoint[] = [];
    currentLines: Line[] = [];
    currentLine: Line;
     */
}
