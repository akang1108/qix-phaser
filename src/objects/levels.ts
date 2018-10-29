import * as Phaser from 'phaser';
declare type integer = number;

import QixScene from "../scenes/qix-scene";
import {config, customConfig} from "../main";

export class Levels {
    coverageTarget: number = customConfig.startCoverageTarget;
    currentLevel: number = customConfig.startLevel;
    scene: QixScene;

    constructor(qix: QixScene) {
        this.scene = qix;
    }

    nextLevel(): void {
        this.currentLevel++;
        customConfig.qixSpeed++;
        customConfig.qixTick--;

        this.scene.player.hasMoved = false;
        this.scene.sparkies.reset();
        this.scene.qixes.reset();
    }
}
