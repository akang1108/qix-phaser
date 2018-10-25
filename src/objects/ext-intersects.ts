import * as Phaser from 'phaser';
declare type integer = number;

import Point = Phaser.Geom.Point;
import {ExtPoint} from "./ext-point";
import Polygon = Phaser.Geom.Polygon;
import {ExtPolygon} from "./ext-polygon";

export class ExtIntersects {

    static PointToPolygon(p: Point, poly: ExtPolygon): boolean {
        return true;
    }

}