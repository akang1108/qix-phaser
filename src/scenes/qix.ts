import {Player} from "../objects/player";
import {Grid} from "../objects/grid";
import {Info} from "../objects/info";
import {Debug} from "../objects/debug";

class Qix extends Phaser.Scene {
    player: Player;
    grid: Grid;
    info: Info;
    cursors: CursorKeys;
    debug: Debug;

    constructor() {
        super({
            key: 'Qix'
        });
    }

    preload() {
    }

    create() {
        this.cursors = this.input.keyboard.createCursorKeys();

        this.grid = new Grid(this);
        this.player = new Player(this, Grid.FRAME_MARGIN, Grid.FRAME_MARGIN);
        this.info = new Info(this, Debug.DEBUG);
        this.debug = new Debug(this);

        // this.player = this.add.sprite(100, 100, 'player');
        // this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        // this.cameras.main.startFollow(this.player, false);
    }

    update(time: number, delta: number) {
        this.debug.update(time, delta);

        if (this.grid.isIllegalMove(this.player, this.cursors)) {
            return;
        }

        this.player.move(this.cursors);
        this.grid.update(this.player);
    }

    // updateDebug(time: number, delta: number) {
    //     if (Qix.DEBUG) {
    //         // const isOutOfBounds = this.grid.isOutOfBounds(this.player, this.cursors);
    //         let lines: string[] = [];
    //
    //         lines = lines.concat(this.grid.debug());
    //         lines.push(`time: ${Math.round(time)}`);
    //         // lines.push(`isOutOfBounds: ${isOutOfBounds}`);
    //         // lines.push(`onExistingGrid: ${this.grid.onExisting(this.player)}`);
    //
    //         this.info.updateDebugText(lines, delta);
    //     }
    // }
}

export default Qix;