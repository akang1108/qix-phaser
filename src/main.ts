import 'phaser';

import QixScene from "./scenes/qix-scene";

const gameWidth = 800;
const gameHeight = 500;
const infoHeight = 30;
const debugTextAreaHeight = 0;
const margin = 10;

export const config:GameConfig = {
    type: Phaser.AUTO,
    parent: 'content',
    width: gameWidth,
    height: gameHeight,
    resolution: 1,
    backgroundColor: "#555",
    scene: [
        QixScene
    ],
    banner: false
};

export const customConfig:GameCustomConfig = {
    debug: false,
    margin: margin,
    frameHeight: gameHeight - infoHeight - (3 * margin),
    infoHeight: infoHeight,
    debugTextAreaHeight: debugTextAreaHeight,
    lineColor: 0x000,
    fillColor: 0xCCAAFF,
    playerRadius: 5,
    playerColor: 0xAA88EE,
    sparkyColor: 0x8B0000,
    speed: 5,
    startCoverageTarget: 60,
    startLevel: 1,
    startNumSparkies: 1,
    sparkyStartupTimesSeconds: [ 3, 10, 30, 60, 200 ],
    levelWinPauseMs: 4000
};

// Fpr debugging
//
// export const customConfig:GameCustomConfig = {
//     debug: true,
//     margin: margin,
//     frameHeight: gameHeight - infoHeight - (3 * margin),
//     infoHeight: infoHeight,
//     debugTextAreaHeight: debugTextAreaHeight,
//     lineColor: 0x000,
//     fillColor: 0xCCAAFF,
//     playerRadius: 5,
//     playerColor: 0xAA88EE,
//     sparkyColor: 0x8B0000,
//     speed: 5,
//     startCoverageTarget: 60,
//     startLevel: 1,
//     startNumSparkies: 1,
//     sparkyStartupTimesSeconds: [ 3, 10, 30, 60, 200 ],
//     levelWinPauseMs: 4000
// };


export const game = new Phaser.Game(config);

export interface GameCustomConfig {
    debug: boolean;
    margin: integer;
    frameHeight: integer;
    infoHeight: integer;
    debugTextAreaHeight: integer;
    lineColor: integer;
    fillColor: integer;
    playerRadius: integer;
    playerColor: integer;
    sparkyColor: integer;
    speed: integer;
    startCoverageTarget: number;
    startLevel: number;
    startNumSparkies: number;
    sparkyStartupTimesSeconds: number[];
    levelWinPauseMs: number;
}

