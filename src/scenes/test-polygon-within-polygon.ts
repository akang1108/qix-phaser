import {Player} from "../objects/player";
import {Grid} from "../objects/grid";
import {Info} from "../objects/info";
import {config} from "../main";
import Graphics = Phaser.GameObjects.Graphics;
import Tween = Phaser.Tweens.Tween;
import TweenDataConfig = Phaser.Tweens.TweenDataConfig;
import {ExtPoint} from "../objects/ext-point";
import Line = Phaser.Geom.Line;

export class TestPolygonWithinPolygon extends Phaser.Scene {
    static DEBUG = true;

    player: Player;
    grid: Grid;
    info: Info;
    cursors: CursorKeys;

    graphics: Graphics;

    currentPolygonPoints: ExtPoint[] = [];
    currentLines: Line[] = [];
    currentLine: Line;

    constructor() {
        super({
            key: 'TestPolygonToRectsScene'
        });
    }

    preload() {
    }

    create() {
        this.cursors = this.input.keyboard.createCursorKeys();

        this.graphics = this.add.graphics();
        this.graphics.lineStyle(1, Grid.LINE_COLOR);
        this.graphics.fillStyle(Grid.FILL_COLOR);

        this.player = new Player(this, 300, 300, 5);
    }

    update(time: number, delta: number) {
        this.player.move(this.cursors);

        if (! this.player.moving()) {
            return;
        }

        if (! this.currentLine) {
            this.createCurrentLine(this.player);
        }
        else if (this.isHorizontal(this.currentLine) && this.player.movingLeft()) {
            this.currentLine.x1 = this.player.x();
        } else if (this.isHorizontal(this.currentLine) && this.player.movingRight()) {
            this.currentLine.x2 = this.player.x();
        } else if (this.isVertical(this.currentLine) && this.player.movingUp()) {
            this.currentLine.y1 = this.player.y();
        } else if (this.isVertical(this.currentLine) && this.player.movingDown()) {
            this.currentLine.y2 = this.player.y();
        }
        // Switching directions
        else {
            this.currentLines.push(this.currentLine);
            this.createCurrentLine(this.player);
        }

        this.graphics.strokeLineShape(this.currentLine);

        return;
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

