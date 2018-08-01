class UIManager 
{
    private static game: Phaser.Game;

    private static transparentRect: Phaser.Graphics;

    private static dialog: DialogMessage;
    private static dialogTimerEvent :Phaser.TimerEvent;
    private static dialogDuration = 2500; // Milliseconds
    public static dialogCallback: Function;
    public static keyCodeToCloseDialog?: Phaser.Key = undefined;

    public static optionDialogData: { callbackEvent?: (selectedOptionA: boolean) => any, confirmA: Phaser.KeyCode, confirmB: Phaser.KeyCode }

    public static get dialogIsOpen() { return this.dialog != undefined; }

    public static readonly leftBlackBarWidth = 80;
    public static readonly rightBlackBarWidth = 112;
    public static get rightBlackBarXPos() { return this.leftBlackBarWidth + LevelManager.levelWidth; }
    public static get levelCenter() { return new Phaser.Point(this.leftBlackBarWidth + LevelManager.levelWidth / 2, LevelManager.levelHeight / 2); }

    static create(game: Phaser.Game)
    {
        this.game = game;

        this.createBlackBars();

        this.optionDialogData = { callbackEvent: undefined, confirmA: undefined, confirmB: undefined };

        HUD.create(game);

        InputManager.confirmKey.onDown.add(this.confirmOptionA, this);
        InputManager.goBackKey.onDown.add(this.confirmOptionB, this);
    }

    static confirmOptionA()
    {
        if (!this.dialogIsOpen) {
            return;
        }

        if (UIManager.optionDialogData.callbackEvent != undefined) {
            UIManager.optionDialogData.callbackEvent(true);
            UIManager.optionDialogData.callbackEvent = undefined;
            UIManager.closeDialog();
        }
    }

    static confirmOptionB()
    {
        if (!this.dialogIsOpen) {
            return;
        }

        if (UIManager.optionDialogData.callbackEvent != undefined) {
            UIManager.optionDialogData.callbackEvent(false);
            UIManager.optionDialogData.callbackEvent = undefined;
            UIManager.closeDialog();
        }
    }

    static update()
    {
        // Close the dialog if the correct key is pressed
        if(this.dialogIsOpen && UIManager.keyCodeToCloseDialog != undefined && UIManager.keyCodeToCloseDialog.justDown) {
            UIManager.closeDialog();
        }
    }

    static createBlackBars()
    {
        var graphics = this.game.add.graphics();

        // Draw left side blackbar
        graphics.lineStyle(0);
        graphics.beginFill(0x000000, 1);
        graphics.drawRect(0, 0, this.leftBlackBarWidth, LevelManager.levelWidth);
        graphics.endFill();

        // Draw right side blackbar
        graphics.beginFill(0x000000, 1);
        graphics.drawRect(this.rightBlackBarXPos, 0, this.rightBlackBarWidth, LevelManager.levelWidth);
        graphics.endFill();
    }

    public static getFont()
    {
        return this.game.add.retroFont("gamefont", 8, 10, Phaser.RetroFont.TEXT_SET2, 16, 2, 0, 3, 82);
    }

    public static openDialog(text: string, callback?: Function, keyToClose?: Phaser.Key, width: number = 154, height: number = 64)
    {
        this.dialog = new DialogMessage(this.game, text, this.levelCenter.x, this.levelCenter.y, width, height);
        this.dialogCallback = callback;

        if (keyToClose != undefined) {
            this.keyCodeToCloseDialog = keyToClose;
            return;
        } 
        // Close the dialog after a certain amount of time
        this.dialogTimerEvent = this.game.time.events.add(this.dialogDuration, this.closeDialog, this);
    }

    public static openOptionDialog(text: string, confirmAKey: Phaser.KeyCode, confirmBKey: Phaser.KeyCode, callback: (selectedOptionA: boolean) => any, width: number = 154, height: number = 64)
    {
        this.optionDialogData.confirmA = confirmAKey;
        this.optionDialogData.confirmB = confirmBKey;
        this.optionDialogData.callbackEvent = callback;
        
        this.dialog = new DialogMessage(this.game, text, this.levelCenter.x, this.levelCenter.y, width, height);
    }

    public static closeDialog()
    {
        this.dialog.destroy();
        this.dialog = undefined;
        this.keyCodeToCloseDialog = undefined;

        // Check if it should call an event after closing the dialog
        if (this.dialogCallback != undefined) {
            let dialogCallbackTemp = this.dialogCallback;
            this.dialogCallback();

            // If there is not a new dialog open make this undifined so that the function doesn't get called again
            if (dialogCallbackTemp == this.dialogCallback) {
                this.dialogCallback = undefined;
            }
        }
    }

    public static showTransparentOverlay(color: number, alhpa: number)
    {
        this.transparentRect = this.game.add.graphics();
        this.transparentRect.lineStyle(0);
        this.transparentRect.beginFill(color, alhpa);
        this.transparentRect.drawRect(LevelManager.levelPosition, 0, LevelManager.levelWidth, LevelManager.levelHeight);
        this.transparentRect.endFill();
    }

    public static hideTransparentOverlay()
    {
        this.transparentRect.destroy();
    }
}