import Graphics = Phaser.GameObjects.Graphics;
import Scene = Phaser.Scene;
import Circle = Phaser.Geom.Circle;
import Point = Phaser.Geom.Point;
import {ExtPoint} from "./ext-point";

export class Player {
    static RADIUS: integer = 5;
    static COLOR: integer = 0xAA88EE;

    graphics: Graphics;

    previousPoint: ExtPoint;

    previousOnExisting: boolean;

    speed: integer;

    constructor(scene: Scene, x: integer, y: integer, speed: integer = 5) {
        this.speed = speed;
        this.graphics = scene.add.graphics();
        this.graphics.lineStyle(1, Player.COLOR);
        this.graphics.fillStyle(Player.COLOR);
        this.graphics.x = x - Player.RADIUS;
        this.graphics.y = y - Player.RADIUS;
        this.graphics.fillCircleShape(new Circle(Player.RADIUS, Player.RADIUS, Player.RADIUS));

        this.previousPoint = this.point();
        this.previousOnExisting = true;
    }

    x(): integer {
        return this.graphics.x + Player.RADIUS;
    }

    y(): integer {
        return this.graphics.y + Player.RADIUS;
    }

    point(): ExtPoint {
        return ExtPoint.createWithCoordinates(this.graphics.x + Player.RADIUS, this.graphics.y + Player.RADIUS);
    }

    move(cursors: CursorKeys) {
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
