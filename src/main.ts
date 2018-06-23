import 'phaser';

import Qix from './scenes/qix';
import {TestPolygonWithinPolygon} from "./scenes/test-polygon-within-polygon";

export const config:GameConfig = {
    type: Phaser.AUTO,
    parent: 'content',
    width: 800,
    height: 600,
    resolution: 1,
    backgroundColor: "#555",
    scene: [
        Qix
    ],
    banner: false
};

// export const config:GameConfig = {
//     type: Phaser.AUTO,
//     parent: 'content',
//     width: 800,
//     height: 600,
//     resolution: 1,
//     backgroundColor: "#555",
//     scene: [
//         TestPolygonWithinPolygon
//     ],
//     // physics: {
//     //     default: 'arcade',
//     //     arcade: {
//     //         gravity: { y: 100 },
//     //         debug: true,
//     //         fps: 10
//     //     }
//     // },
//     banner: false
// };


export const game = new Phaser.Game(config);

