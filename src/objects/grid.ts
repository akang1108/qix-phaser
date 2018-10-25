import * as Phaser from 'phaser';
declare type integer = number;

import Graphics = Phaser.GameObjects.Graphics;
import Rectangle = Phaser.Geom.Rectangle;
import {config, customConfig} from "../main";
import {Player} from "./player";
import {ExtPoint} from "./ext-point";
import QixScene from "../scenes/qix-scene";
import {FilledPolygons} from "./filled-polygons";
import {ExtRectangle} from "./ext-rectangle";
import {CurrentLines} from "./current-lines";
import {AllPoints} from "./all-points";
import {Sparkies} from "./sparkies";

export class Grid {
    static FRAME_HEIGHT_PERCENT: number = .7;

    scene: QixScene;
    filledPolygons: FilledPolygons;
    currentLines: CurrentLines;
    allPoints: AllPoints;

    frameGraphics: Graphics;
    frame: ExtRectangle;
    frameArea: number;

    constructor(scene: QixScene) {
        this.scene = scene;
        this.filledPolygons = new FilledPolygons(scene);
        this.currentLines = new CurrentLines(scene);
        this.createFrame();

        this.allPoints = new AllPoints(this.scene, this.frame.rectangle);
    }

    createFrame(): void {
        this.frameGraphics = this.scene.add.graphics();
        this.frameGraphics.lineStyle(1, customConfig.lineColor);
        this.frameGraphics.fillStyle(customConfig.fillColor);

        this.frame = new ExtRectangle(new Rectangle(
            customConfig.margin,
            customConfig.margin,
            config.width as number - (2 * customConfig.margin),
            customConfig.frameHeight));

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

    checkAndUpdateForClosedLoop(player: Player): void {
        // Check for closed loop
        if (! this.onExistingLine(player)) {
            return;
        }

        this.currentLines.points.push(player.point());
        const points = this.currentLines.points;

        // Check for not enough points or circular loop
        if (points.length < 2 || points[0].equals(points[points.length - 1])) {
            this.currentLines.reset();
            return;
        }

        const newPolygonPoints = this.allPoints.calculateNewClockwisePolygonPoints(this.currentLines.points);
        this.filledPolygons.drawFilledPolygon(newPolygonPoints);
        this.allPoints.updateNewInnerPoints(newPolygonPoints);

        // this.qix.debug.highlightPoints(newPolygonPoints, 3, true, 300, 700);
        this.scene.debug.drawPoints1(newPolygonPoints);
        this.scene.debug.infoPoints('newPolygonPoints', newPolygonPoints);

        // this.qix.debug.debugHighlightPoints(this.allPoints.innerPolygonPointsClockwise, 4, true, 300, 700, 0xBB22AA);
        this.scene.debug.drawPoints2(this.allPoints.innerPolygonPointsClockwise);
        this.scene.debug.infoPoints('innerPolygonPointsClockwise', this.allPoints.innerPolygonPointsClockwise);

        // this.qix.debug.debugConsolePoints('points', this.currentLines.points);

        this.currentLines.reset();
    }

    onExistingLine(player: Player): boolean {
        return this.frame.pointOnOutline(player.point().point) || this.filledPolygons.pointOnLine(player.point());
    }

    firstPointAndLastPointSame(player: Player): boolean {
        return this.frame.pointOnOutline(player.point().point) || this.filledPolygons.pointOnLine(player.point());
    }

    isIllegalMove(player: Player, cursors: CursorKeys): boolean {
        const newPosition = player.getMove(cursors);
        newPosition.x += customConfig.playerRadius;
        newPosition.y += customConfig.playerRadius;

        const outOfBounds =
            (newPosition.x < this.frame.rectangle.x) ||
            (newPosition.x > this.frame.rectangle.x + this.frame.rectangle.width) ||
            (newPosition.y < this.frame.rectangle.y) ||
            (newPosition.y > this.frame.rectangle.y + this.frame.rectangle.height);

        const withinFilledPolygon = this.filledPolygons.pointWithinPolygon(new ExtPoint(newPosition));

        const hittingCurrentLines = this.currentLines.lines.some((line) => {
            return Phaser.Geom.Intersects.PointToLineSegment(newPosition, line);
        });

        return outOfBounds || withinFilledPolygon || hittingCurrentLines;
    }



}
