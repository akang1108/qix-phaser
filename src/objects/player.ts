import * as Phaser from 'phaser';
declare type integer = number;

import Graphics = Phaser.GameObjects.Graphics;
import Scene = Phaser.Scene;
import Circle = Phaser.Geom.Circle;
import Point = Phaser.Geom.Point;
import {ExtPoint} from "./ext-point";
import {customConfig} from "../main";

export class Player {

    graphics: Graphics;

    previousPoint: ExtPoint;

    previousOnExisting: boolean;

    speed: integer;

    hasMoved: boolean = false;

    constructor(scene: Scene, x: integer, y: integer) {
        this.speed = customConfig.playerSpeed;
        this.graphics = scene.add.graphics();
        this.graphics.lineStyle(1, customConfig.playerColor);
        this.graphics.fillStyle(customConfig.playerColor);
        this.graphics.x = x - customConfig.playerRadius;
        this.graphics.y = y - customConfig.playerRadius;
        this.graphics.fillCircleShape(new Circle(customConfig.playerRadius, customConfig.playerRadius, customConfig.playerRadius));

        this.previousPoint = this.point();
        this.previousOnExisting = true;
    }

    x(): integer {
        return this.graphics.x + customConfig.playerRadius;
    }

    y(): integer {
        return this.graphics.y + customConfig.playerRadius;
    }

    point(): ExtPoint {
        return ExtPoint.createWithCoordinates(this.graphics.x + customConfig.playerRadius, this.graphics.y + customConfig.playerRadius);
    }

    move(cursors: CursorKeys) {
        if (! this.previousPoint.equals(this.point())) {
            this.hasMoved = true;
        }

        this.previousPoint = this.point();

        const newPosition = this.getMove(cursors);
        this.graphics.x = newPosition.x;
        this.graphics.y = newPosition.y;
    }

    moving(): boolean {
        return this.movingLeft() || this.movingRight() || this.movingUp() || this.movingDown();
    }

    movingLeft(): boolean { return this.x() < this.previousPoint.x(); }
    movingRight(): boolean { return this.x() > this.previousPoint.x(); }
    movingUp(): boolean { return this.y() < this.previousPoint.y(); }
    movingDown(): boolean { return this.y() > this.previousPoint.y(); }
    movingHoriziontally(): boolean { return this.movingLeft() || this.movingRight(); }
    movingVertically(): boolean { return this.movingUp() || this.movingDown(); }

    getMove(cursors: CursorKeys): Point {
        let x = this.graphics.x;
        let y = this.graphics.y;

        if (cursors.left.isDown) {
            x -= this.speed;
        } else if (cursors.right.isDown) {
            x += this.speed;
        } else if (cursors.up.isDown) {
            y -= this.speed;
        } else if (cursors.down.isDown) {
            y += this.speed;
        }

        return new Point(x, y);
    }


}
