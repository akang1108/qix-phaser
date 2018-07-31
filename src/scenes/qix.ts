import {Player} from "../objects/player";
import {Grid} from "../objects/grid";
import {Info} from "../objects/info";
import {Debug} from "../objects/debug";
import {customConfig} from "../main";
import {Levels} from "../objects/levels";
import TimerEvent = Phaser.Time.TimerEvent;

class Qix extends Phaser.Scene {
    player: Player;
    grid: Grid;
    info: Info;
    cursors: CursorKeys;
    debug: Debug;
    levels: Levels;
    pauseTimer: TimerEvent;

    constructor() {
        super({
            key: 'Qix'
        });
    }

    preload() {
    }

    create() {
        this.cursors = this.input.keyboard.createCursorKeys();

        this.levels = new Levels();
        this.grid = new Grid(this);
        this.player = new Player(this, customConfig.margin, customConfig.margin);
        this.info = new Info(this);
        this.debug = new Debug(this);

        this.pauseTimer = this.time.addEvent({ callback: this.delayCallback, paused: true });


        // this.player = this.add.sprite(100, 100, 'player');
        // this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        // this.cameras.main.startFollow(this.player, false);
    }

    update(time: number, delta: number) {
        if (! this.pauseTimer.paused && this.pauseTimer.getElapsedSeconds() < 10) {
            console.info(this.pauseTimer.getElapsedSeconds());
            return;
        }

        if (this.grid.isIllegalMove(this.player, this.cursors)) {
            return;
        }

        this.player.move(this.cursors);
        this.grid.update(this.player);
        this.info.updateGameText();
        if (this.grid.checkForWin()) {
            this.pauseTimer.paused = false;
            // this.scene.restart({});
        }

    }

    delayCallback(): void {
        console.info('callback');
    }


}

export default Qix;