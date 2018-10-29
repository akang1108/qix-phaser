import * as Phaser from 'phaser';
declare type integer = number;

import Graphics = Phaser.GameObjects.Graphics;
import Point = Phaser.Geom.Point;
import Line = Phaser.Geom.Line;
import Set = Phaser.Structs.Set;
import {ExtPoint} from "./ext-point";
import {customConfig} from "../main";
import QixScene from "../scenes/qix-scene";
import {Direction} from "./direction";
import {ExtPolygon} from "./ext-polygon";

export class Sparky {

    scene: QixScene;

    graphics: Graphics;

    speed: integer;

    pointSize: integer = 3;

    pointRange: integer = 7;

    x: integer;

    y: integer;

    direction: Direction;

    tick: integer;

    tickCount: integer = 0;

    constructor(scene: QixScene, x: integer, y: integer) {
        this.scene = scene;
        this.x = x;
        this.y = y;

        this.speed = customConfig.sparkySpeed;
        this.tick = customConfig.sparkyTick;

        this.redraw();
    }

    update(): void {
        this.redraw();
    }

    destroy(): void {
        this.graphics.destroy();
    }

    redraw(): void {
        if ((this.tickCount + 1) < this.tick) {
            this.tickCount++;
            return;
        }

        this.move();

        this.tickCount = 0;

        if (this.graphics) {
            this.graphics.destroy();
        }

        this.graphics = this.scene.add.graphics();
        this.graphics.lineStyle(2, customConfig.sparkyColor);
        this.graphics.fillStyle(customConfig.sparkyColor);
        this.draw();
    }

    move(): void {
        let directions = this.getFilteredPossibleDirections();

        let randomIndex = Math.floor(Math.random() * directions.size);
        let randomDirection = directions.getArray()[randomIndex];

        this.moveWithDirection(randomDirection);
        this.direction = randomDirection;
    }

    getPoint(): Point {
        return new Point(this.x, this.y);
    }

    getExtPoint(): ExtPoint {
        return new ExtPoint(this.getPoint());
    }

    private getUpPoint(): Point { return new Point(this.x, this.y - this.speed); }
    private getDownPoint(): Point { return new Point(this.x, this.y + this.speed); }
    private getLeftPoint(): Point { return new Point(this.x - this.speed, this.y); }
    private getRightPoint(): Point { return new Point(this.x + this.speed, this.y); }

    private moveUp(): void { this.y -= this.speed; }
    private moveDown(): void { this.y += this.speed; }
    private moveLeft(): void { this.x -= this.speed; }
    private moveRight(): void { this.x += this.speed; }

    private moveWithDirection(direction: Direction): void {
        switch (direction) {
            case Direction.UP: this.moveUp(); break;
            case Direction.DOWN: this.moveDown(); break;
            case Direction.LEFT: this.moveLeft(); break;
            case Direction.RIGHT: this.moveRight(); break;
        }
    }

    /**
     * Return any perpendicular (as compared to current direction) directions found in the passed in set of directions
     */
    private perpendicularDirections(directions: Set<Direction>): Set<Direction> {
        let perpendicularDirections: Set<Direction> = new Set();

        if (this.direction === Direction.UP || this.direction === Direction.DOWN) {
            if (directions.contains(Direction.LEFT)) perpendicularDirections.set(Direction.LEFT);
            if (directions.contains(Direction.RIGHT)) perpendicularDirections.set(Direction.RIGHT);
        } else {
            if (directions.contains(Direction.UP)) perpendicularDirections.set(Direction.UP);
            if (directions.contains(Direction.DOWN)) perpendicularDirections.set(Direction.DOWN);
        }

        return perpendicularDirections;
    }

    /**
     * Get a filtered set of possible directions based on current direction already moving and whether a junction is hit
     */
    private getFilteredPossibleDirections(): Set<Direction> {
        let directions = this.getPossibleDirections();

        if (directions.contains(this.direction)) {
            directions = this.perpendicularDirections(directions);
            directions.set(this.direction);
        }

        return directions;
    }

    private getPossibleDirections(): Set<Direction> {
        let directions: Set<Direction> = new Set();

        //
        // Determine possible directions on frame
        //
        const frame = this.scene.grid.frame;
        const onFrame = frame.pointOnOutline(this.getPoint());

        if (onFrame) {
            if (frame.pointOnOutline(this.getUpPoint())) directions.set(Direction.UP);
            if (frame.pointOnOutline(this.getDownPoint())) directions.set(Direction.DOWN);
            if (frame.pointOnOutline(this.getLeftPoint())) directions.set(Direction.LEFT);
            if (frame.pointOnOutline(this.getRightPoint())) directions.set(Direction.RIGHT);
        }

        const filledPolygons = this.scene.grid.filledPolygons;
        const onFilledPolygon = filledPolygons.pointOnLine(this.getExtPoint());

        const addDirectionsFromLines = ((dirs: Set<Direction>, lines: Line[]) => {
            lines.forEach((line: Line) => {
                if (Phaser.Geom.Intersects.PointToLineSegment(this.getUpPoint(), line)) dirs.set(Direction.UP);
                if (Phaser.Geom.Intersects.PointToLineSegment(this.getDownPoint(), line)) dirs.set(Direction.DOWN);
                if (Phaser.Geom.Intersects.PointToLineSegment(this.getLeftPoint(), line)) dirs.set(Direction.LEFT);
                if (Phaser.Geom.Intersects.PointToLineSegment(this.getRightPoint(), line)) dirs.set(Direction.RIGHT);
            });
        });

        //
        // Determine possible directions on a filled polygon
        //
        if (onFilledPolygon) {
            let lines: Line[] = [];

            filledPolygons.polygons.forEach((polygon: ExtPolygon) => {
                lines.push(...polygon.lines);
            });

            addDirectionsFromLines(directions, lines);
        }

        //
        // Determine possible directions on current lines
        //
        const currentLines = this.scene.grid.currentLines;
        addDirectionsFromLines(directions, currentLines.lines);

        return directions;
    }

    private draw(): void {
        const numPoints = 5;

        for (let i = 0; i < numPoints; i++) {
            this.graphics.fillPoint(this.x + this.rand(), this.y + this.rand(), this.pointSize);
        }
    }

    private rand(): integer {
        let rand = Math.floor(Math.random() * Math.floor(this.pointRange));

        if (Math.random() < .5) {
            return -rand
        } else {
            return rand;
        }
    }

}
