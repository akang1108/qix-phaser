import * as Phaser from 'phaser';
declare type integer = number;

import QixScene from "../scenes/qix-scene";
import {customConfig} from "../main";
import {Player} from "./player";
import {Qix} from "./qix";

export class Qixes {
    qixes: Qix[] = [];
    scene: QixScene;
    startingNumQixes: number = customConfig.startNumQixes;
    qixStartupTimeSeconds: number[] = customConfig.qixStartupTimesSeconds;
    START_TIME_UNDEFINED: number = 0;
    startTime: number = this.START_TIME_UNDEFINED;

    constructor(scene: QixScene) {
        this.scene = scene;

    }

    update() {
        // if (! this.scene.player.hasMoved) {
        //     return;
        // }

        const nextStartupTimeMilliseconds = this.qixStartupTimeSeconds[this.qixes.length] * 1000;
        this.startTime = (this.startTime === this.START_TIME_UNDEFINED) ? this.scene.time.now : this.startTime;
        const timeSinceStart = this.scene.time.now - this.startTime;

        if (timeSinceStart > nextStartupTimeMilliseconds) {
            this.qixes.push(new Qix(this.scene, 200, 200));
        }

        this.qixes.forEach((qix) => {
            qix.update();
        });
    }

    checkForCollisionWithPlayer(): boolean {
        let collision = false;

        this.qixes.forEach((qix) => {
           if (qix.getExtPoint().equals(this.scene.player.point()))  {
               collision = true;
           }
        });

        return collision;
    }

    reset() {
        this.qixes.forEach((qix) => {
            qix.destroy();
        });
        this.qixes = [];
        this.startTime = this.START_TIME_UNDEFINED;
    }

}
