class Cheats
{
    
    private static keyCommandsTimer: number;
    private static readonly keyCommandsInterval: number = 300; // Miliseconds
    private static readonly maxCommands: number = 13;

    private static jellyPowerCheat = [Phaser.Keyboard.J, Phaser.Keyboard.E, Phaser.Keyboard.L, Phaser.Keyboard.L, Phaser.Keyboard.Y];
    private static stopWaterPowerCheat = [Phaser.Keyboard.W, Phaser.Keyboard.A, Phaser.Keyboard.T, Phaser.Keyboard.E, Phaser.Keyboard.R];
    private static maxLifesCheat = [Phaser.Keyboard.L, Phaser.Keyboard.I, Phaser.Keyboard.F, Phaser.Keyboard.E, Phaser.Keyboard.S];
    private static zeroLifesCheat = [Phaser.Keyboard.D, Phaser.Keyboard.E, Phaser.Keyboard.A, Phaser.Keyboard.D];
    private static nextStageCheat = [Phaser.Keyboard.N, Phaser.Keyboard.E, Phaser.Keyboard.X, Phaser.Keyboard.T];
    private static stopObjectsCheat = [Phaser.Keyboard.S, Phaser.Keyboard.T, Phaser.Keyboard.O, Phaser.Keyboard.P];
    private static slowMotionCheat = [Phaser.Keyboard.S, Phaser.Keyboard.L, Phaser.Keyboard.O, Phaser.Keyboard.W];
    private static speedUpCheat = [Phaser.Keyboard.F, Phaser.Keyboard.A, Phaser.Keyboard.S, Phaser.Keyboard.T];
    
    private static currentCommands = [];

    public static localCanUseCheats: boolean = false;
    private static localCheatUsedCheck: boolean = false;

    public static get hasUsedCheats(): boolean { return this.localCheatUsedCheck; }
    public static get canUseCheats(): boolean { return this.localCanUseCheats; }

    public static activateCheats(game: Phaser.Game)
    {
        game.input.keyboard.onDownCallback = this.onKeyPress;
        
        this.localCanUseCheats = true;
    }

    public static update(game: Phaser.Game)
    {
        if (!this.canUseCheats) {
            return;
        }

        this.keyCommandsTimer += game.time.physicsElapsedMS;

        if (this.keyCommandsTimer >= this.keyCommandsInterval)
        {
            this.keyCommandsTimer = 0;
            this.currentCommands = [];
        }
    }

    private static onKeyPress(e)
    {
        if (Cheats.currentCommands.length < Cheats.maxCommands) {
            Cheats.currentCommands.push(e.keyCode);
        }

        Cheats.keyCommandsTimer = 0;

        if (Cheats.compareCommandsWithCheat(Cheats.jellyPowerCheat)) {
            // Applies double jump power for a minute
            LevelManager.squid.applyDoubleJumpPower(60000);
            HUD.refreshUI();
            console.log("Double Jump Activated");
        }
        else if (Cheats.compareCommandsWithCheat(Cheats.stopWaterPowerCheat)) {
            // Stops the water from rising, or makes it start rising if it was already stopped
            LevelManager.water.isRisingByDefault = !LevelManager.water.isRisingByDefault;
            LevelManager.water.isRising = LevelManager.water.isRisingByDefault;
            HUD.refreshUI();
            console.log("Water Stopped");
        }
        else if (Cheats.compareCommandsWithCheat(Cheats.maxLifesCheat)) {
            HUD.lifes = HUD.maxLifes;
            HUD.refreshUI();
            console.log("Max Lifes");
        }
        else if (Cheats.compareCommandsWithCheat(Cheats.zeroLifesCheat)) {
            HUD.lifes = 0;
            HUD.refreshUI();
            console.log("No Lifes");
        }
        else if (Cheats.compareCommandsWithCheat(Cheats.nextStageCheat)) {
            LevelManager.nextLevel();
            console.log("Next Stage");
        }
        else if (Cheats.compareCommandsWithCheat(Cheats.stopObjectsCheat)) {
            GameTimer.objectsSpeed = 0;
            console.log("Stopped Level Objects");
        }
        else if (Cheats.compareCommandsWithCheat(Cheats.slowMotionCheat)) {
            GameTimer.levelSpeed = 0.5;
            console.log("Slow Motion");
        }
        else if (Cheats.compareCommandsWithCheat(Cheats.speedUpCheat)) {
            GameTimer.levelSpeed = 2;
            console.log("Speed Up");
        }
    }

    private static compareCommandsWithCheat(cheatCommands): boolean
    {
        if (cheatCommands.length != this.currentCommands.length) {
            return false;
        }
        for (let i = 0; i < cheatCommands.length; i++) {
            if (cheatCommands[i] != this.currentCommands[i]) {
                return false;
            }
        }

        // Reset the commands
        this.currentCommands = [];
        // Using cheats will prevent the player from scoring any points
        HUD.disableScore();
        // The player has used a cheat
        this.localCheatUsedCheck = true;

        return true;
    }
}