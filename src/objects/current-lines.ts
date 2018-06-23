import Graphics = Phaser.GameObjects.Graphics;
import Rectangle = Phaser.Geom.Rectangle;
import Line = Phaser.Geom.Line;
import {config} from "../main";
import {Player} from "./player";
import {ExtPoint} from "./ext-point";
import Qix from "../scenes/qix";
import {FilledPolygons} from "./filled-polygons";
import {ExtRectangle} from "./ext-rectangle";
import {Grid} from "./grid";


export class CurrentLines {
    qix: Qix;

    currentLineGraphics: Graphics;
    currentPolygonPoints: ExtPoint[] = [];
    currentLines: Line[] = [];
    currentLine: Line;

    grid(): Grid {
        return this.qix.grid;
    }

    constructor(qix: Qix) {
        this.qix = qix;

        this.currentLineGraphics = this.qix.add.graphics();
        this.currentLineGraphics.lineStyle(1, Grid.LINE_COLOR);
        this.currentLineGraphics.fillStyle(Grid.FILL_COLOR);
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

        this.currentLineGraphics.strokeLineShape(this.currentLine);
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

}
