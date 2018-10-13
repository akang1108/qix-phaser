import {Player} from "../objects/player";
import {Grid} from "../objects/grid";
import {Info} from "../objects/info";
import {Debug} from "../objects/debug";
import {config, customConfig} from "../main";
import {Levels} from "../objects/levels";
import TimerEvent = Phaser.Time.TimerEvent;
import Scene = Phaser.Scene;
import {Sparkies} from "../objects/sparkies";
import Text = Phaser.GameObjects.Text;

class QixScene extends Phaser.Scene {
    player: Player;
    sparkies: Sparkies;
    grid: Grid;
    info: Info;
    cursors: CursorKeys;
    debug: Debug;
    pauseControl: PauseControl;
    levels = new Levels(this);

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
        this.player = new Player(this, customConfig.margin, customConfig.margin);
        this.info = new Info(this);
        this.debug = new Debug(this);

        this.pauseControl = new PauseControl();
        this.sparkies = new Sparkies(this);

        // this.player = this.add.sprite(100, 100, 'player');
        // this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        // this.cameras.main.startFollow(this.player, false);
    }

    update(time: number, delta: number) {
        if (this.pauseControl.isPaused(time)) {
            return;
        }

        if (this.grid.isIllegalMove(this.player, this.cursors)) {
            return;
        }

        this.player.move(this.cursors);
        this.sparkies.update();
        this.grid.update(this.player);
        this.info.updateGameText();

        if (this.checkForWin()) {
            this.passLevel(time);
        }

        if (this.checkForLoss()) {
            this.loseLife(time);
        }
    }


    checkForLoss(): boolean {
        return this.sparkies.checkForCollisionWithPlayer();
    }

    loseLife(time: number) {
        this.pauseControl.pauseForWin(time);
        this.cameras.main.shake(300, .005);
        this.pauseControl.pauseForWin(time);
        this.cameras.main.shake(300, .005);
        let winText = this.createWinText(`Ouch!!!.`, "#333333");

        const _this = this;
        setTimeout(function () {
            winText.destroy();
            _this.scene.restart({});
        }, customConfig.levelWinPauseMs / 2);
    }

    checkForWin(): boolean {
        return (this.grid.filledPolygons.percentArea() >= this.levels.coverageTarget);
    }

    options = { fontFamily: 'Courier', fontSize: '30px', color: '#bb33bb', align: 'center',
        radiusX: '10px', radiusY: '10px',
        padding: { x: 10, y: 10 }
    };

    passLevel(time: number) {
        this.pauseControl.pauseForWin(time);
        this.cameras.main.shake(300, .005);
        let winText = this.createWinText(`Sweet!!\nLevel ${this.levels.currentLevel} passed.`, "#333333");

        const _this = this;
        setTimeout(function () {
            winText.destroy();
            _this.levels.nextLevel();
            winText = _this.createWinText(`On to level ${_this.levels.currentLevel}`, "#333333");

            setTimeout(function () {
                _this.scene.restart({});
            }, customConfig.levelWinPauseMs / 2);
        }, customConfig.levelWinPauseMs / 2);
    }

    createWinText(message: string, color: string): Text {
        const x = ((config.width as number) / 3);
        const y = ((customConfig.frameHeight as number) / 2) - 35;
        let winText = this.add.text(x, y, message, this.options);
        winText.setShadow(3, 3, color, 2, true, true);
        return winText;
    }
}

class PauseControl {
    private paused: boolean = false;
    private winTime: number;

    constructor() {
    }

    isPaused(time: number): boolean {
        return this.paused;
    }

    pauseForWin(time: number): void {
        this.paused = true;
        this.winTime = time;
    }
}

export default QixScene;