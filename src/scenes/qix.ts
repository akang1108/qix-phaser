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

        this.info.updateGameText();
    }
}

export default Qix;