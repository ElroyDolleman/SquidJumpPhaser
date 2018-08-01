class GameState extends Phaser.State
{
    readonly holdDurationToActivateCheats: number = 5000; // Miliseconds
    public static gameIsPaused: boolean = true;

    preload()
    {
        
    }

    create()
    {
        GameTimer.initialize(this.game);

        InputManager.initialize(this.game);

        LevelManager.initialize(this.game);
        UIManager.create(this.game);
        
        if (GameState.gameIsPaused) {
            this.showPauseMenu();
        }

        this.game.stage.smoothed = false;
    }

    update()
    {
        // Update the UI
        UIManager.update();

        if (GameState.gameIsPaused) {
            // Check if the player activates/deactivates cheats
            if (!Cheats.canUseCheats && InputManager.cheatKey.duration > this.holdDurationToActivateCheats) {
                UIManager.closeDialog();
                this.closePauseMenu();

                Cheats.activateCheats(this.game);
            }
            // Restart the game if the player presses the goBackKey
            if (InputManager.goBackKey.downDuration(30)) {
                UIManager.closeDialog();
                this.closePauseMenu();

                LevelManager.gameOver();
            }
        }

        // Check if the player just paused the game
        if (InputManager.pauseKey.justDown && !UIManager.dialogIsOpen) {
            this.showPauseMenu();
        }

        // Update the cheat codes check
        Cheats.update(this.game);

        // Update the level if the game is not paused
        LevelManager.update();
    }

    showPauseMenu()
    {
        UIManager.showTransparentOverlay(0, 0.4);
        UIManager.openDialog("PAUSE\n\nPRESS P TO CONTINUE\n\nPRESS BACKSPACE TO RESTART", this.closePauseMenu, InputManager.pauseKey, 220, 80);

        GameState.gameIsPaused = true;
    }

    closePauseMenu()
    {
        UIManager.hideTransparentOverlay();

        GameState.gameIsPaused = false;
    }
}