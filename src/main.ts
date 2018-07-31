import 'phaser';

import Qix from './scenes/qix';

export const config:GameConfig = {
    type: Phaser.AUTO,
    parent: 'content',
    width: 800,
    height: 500,
    resolution: 1,
    backgroundColor: "#555",
    scene: [
        Qix
    ],
    banner: false
};

export const customConfig:GameCustomConfig = {
    debug: true,
    margin: 10,
    frameHeight: 150,
    infoHeight: 30,
    debugTextAreaHeight: 300,
    lineColor: 0x000,
    fillColor: 0xCCAAFF
};

export const game = new Phaser.Game(config);

export interface GameCustomConfig {
    debug: boolean;
    margin: integer;
    frameHeight: integer;
    infoHeight: integer;
    debugTextAreaHeight: integer;
    lineColor: integer;
    fillColor: integer;
}

