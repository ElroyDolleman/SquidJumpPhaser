class LevelManager
{
    private static game: Phaser.Game;

    public static purpleInk: PurpleInk;
    public static squid: Squid;
    private static camera: Camera;

    public static platforms: Platform[] = [];
    public static powerUps: PowerUp[] = [];

    private static background: Phaser.TileSprite;
    private static backgroundPosition: Phaser.Point;

    private static backgroundGroup: Phaser.Group;
    private static objectGroup: Phaser.Group;
    private static foregroundGroup: Phaser.Group;

    public static readonly leftSide = 0;
    public static readonly rightSide = 240;
    public static readonly levelPosition = 80;
    private static readonly backgroundMovingSpeed = new Phaser.Point(0.96, 4.32);

    private static readonly checkpoints: number[] = [6, 11, 16, 21];

    public static get levelWidth(): number { return this.rightSide - this.leftSide; }
    public static get levelHeight(): number { return 240; }

    private static get levelGoalMessage(): string { return "GOAL!\nSTAGE BONUS " + this.stageBonusText + "\nTIME  BONUS " + this.timeBonusText; }
    private static get loseLifeMessage(): string { return "MISS!"; }
    private static get gameOverMessage(): string { return "GAME OVER!"; }
    private static get continueMessage(): string { return this.gameOverMessage + "\nCONTINUE?\nYES: ENTER  \n  NO : BACKSPACE"; }
    private static get finalLevelMessage(): string { return Cheats.hasUsedCheats ? "CHEATER!" : "CONGRATULATION!"; }
    

    private static get backgroundColor(): Phaser.Color {
        if (HUD.currentStage <= 10) {
            return 0x30306a;
        }
        else if (HUD.currentStage <= 20) {
            return 0x033f52;
        }
        return 0x5047fa;
    };

    private static get stageBonus(): number { 
        if (HUD.currentStage < 10) {
            return 300;
        }
        else if (HUD.currentStage < 20) {
            return 600;
        }
        return 1000;
    }

    private static get timeBonus(): number {
        return Math.max(0, 1200 - Math.floor(GameTimer.currrentTime / 100) * 3);
    }

    private static get stageBonusText(): string { 
        return ("    " + this.stageBonus).slice(-4); 
    }

    private static get timeBonusText(): string {
        return ("    " + this.timeBonus).slice(-4);
    }

    // All the levels that gives you a bonus life
    private static readonly lifeBonusLevels: number[] = [16];

    public static initialize(game: Phaser.Game)
    {
        this.game = game;

        // Creating the groups
        this.backgroundGroup = game.add.group(game.world);
        this.objectGroup = game.add.group(game.world);
        this.foregroundGroup = game.add.group(game.world);

        this.backgroundGroup.position.x = this.levelPosition;
        this.objectGroup.position.x = this.levelPosition;
        this.foregroundGroup.position.x = this.levelPosition;

        // Creating the background
        this.background = game.add.tileSprite(0, 0, 240, this.game.world.bounds.height, 'sheet');
        this.background.setFrame(new Phaser.Frame(0, 2, 126, 240, 240, "frame0"));

        this.backgroundPosition = new Phaser.Point(0, 0);
        this.backgroundGroup.add(this.background);

        // Creating the purple ink
        this.purpleInk = new PurpleInk(game);
        this.foregroundGroup.add(this.purpleInk.topPurpleInkSprite);
        this.foregroundGroup.add(this.purpleInk.bottomPurpleInkSprite);

        // Creating the squid
        this.squid = new Squid(game);
        this.objectGroup.add(this.squid.sprite);
        this.objectGroup.add(this.squid.sparklesEffectSprite);

        this.camera = new Camera(this.squid);

        // Sorting the checkpoints
        this.checkpoints.sort((n1,n2) => n2 - n1);
        
        this.createLevel(HUD.currentStage);
    }    

    private static createLevel(stage: number)
    {
        // Generate the level
        LevelGenerator.generateLevel(this.game, stage);
        this.updatePlatforms();

        this.reset();
    }

    public static reset()
    {
        // Placing the squid on the ground
        this.squid.reset();
        this.squid.sprite.position.set(this.levelWidth / 2, this.platforms[0].yPosition);

        this.purpleInk.Reset();
        this.camera.reset();
        GameTimer.reset();

        this.powerUps.forEach(power => {
            power.isActive = true;
        });

        this.game.stage.backgroundColor = this.backgroundColor;
    }

    static addPlatform(platform: Platform)
    {
        this.backgroundGroup.add(platform.sprite);
        this.platforms.push(platform);
        this.camera.placeTileSpriteInScreen(platform.sprite, platform.yPosition);
    }

    static addPowerUp(powerUp: PowerUp)
    {
        this.objectGroup.add(powerUp.sprite);
        this.powerUps.push(powerUp);
        this.camera.placeSpriteInScreen(powerUp.sprite, powerUp.yWorldPosition);
    }

    static update()
    {
        if (!UIManager.dialogIsOpen) {
            this.updateSquid();

            if (!this.squid.isDead) {
                // Update Camera
                this.camera.update();

                // Update Level Elements
                this.updatePlatforms();
                this.updateBackground();
                this.updatePowerUps();
                this.updatePurpleInk();

                // Update UI
                GameTimer.update(this.game);
                HUD.updateTimer();
            }
        }
        // The squid should continue to update if the dead dialog is open so that the dead animation will play correctly
        else if (this.squid.isDead){
            this.squid.update();
        }
    }

    private static updateSquid()
    {
        this.squid.update();

        // Squid will be warped to the other side of the screen when it moved outside the screen
        if (this.squid.sprite.position.x > this.rightSide) {
            this.squid.sprite.position.x = this.leftSide;
        }
        else if (this.squid.sprite.position.x < this.leftSide) {
            this.squid.sprite.position.x = this.rightSide;
        }
    }

    private static updateBackground()
    {
        // Move the background slowly
        this.backgroundPosition.add(this.backgroundMovingSpeed.x * GameTimer.levelDeltaTime, this.backgroundMovingSpeed.y * GameTimer.levelDeltaTime);

        // Update the background position
        this.background.tilePosition.x = this.backgroundPosition.x;
        this.background.tilePosition.y = this.backgroundPosition.y + this.camera.yPosition;
    }

    private static updatePlatforms()
    {
        this.platforms.forEach(platform => {
            platform.update();

            this.camera.placeTileSpriteInScreen(platform.sprite, platform.yPosition);

            this.squid.updatePlatformCollision(platform);
        });
    }

    private static updatePowerUps() 
    {
        for (var i = 0; i < this.powerUps.length; i++) {
            var powerUp = this.powerUps[i];
            if (!powerUp.isActive) {
                continue;
            }
            this.camera.placeSpriteInScreen(powerUp.sprite, powerUp.yWorldPosition);

            if (this.squid.collidesWith(powerUp.hitbox)) {
                switch(powerUp.powerUpType) {
                    case PowerUpTypes.Zapfish:
                        UIManager.openDialog(this.levelGoalMessage, this.finishLevel);
                    break;
                    case PowerUpTypes.RedFish: 
                        this.squid.applyJumpForce(PowerUp.redFishJumpForce);
                    break;
                    case PowerUpTypes.JellyFish: 
                        this.squid.applyDoubleJumpPower(PowerUp.powerUpDuration);
                    break;
                    case PowerUpTypes.StarFish: 
                        this.squid.applySpeedUpPower(PowerUp.powerUpDuration);
                    break;
                }

                // Make the pickup inactive after its used
                if (powerUp.powerUpType != PowerUpTypes.Zapfish) {
                    powerUp.isActive = false;
                }
            }
        }
    }

    // Finishing level logic is in a different function. Using 'this' reference doesn't work, so another function is called instead.
    private static finishLevel()
    {
        if (HUD.currentStage != HUD.finalStage) {
            LevelManager.nextLevel();
        }
        else {
            UIManager.openDialog(LevelManager.finalLevelMessage, LevelManager.finishGame);
        }
    }

    public static nextLevel()
    {
        // Update the UI values 
        HUD.addScore(this.stageBonus + this.timeBonus);
        HUD.currentStage++;

        // Just in case it goes past the final stage
        if (HUD.currentStage > HUD.finalStage) {
            this.gameOver();
            return;
        }

        // Check if the player recieves an extra life
        if (this.lifeBonusLevels.indexOf(HUD.currentStage) > -1) {
            HUD.addLifes(1);
        }

        // Destroy the level
        this.destroyLevel();

        this.purpleInk.isRising = this.purpleInk.isRisingByDefault;

        // Refresh the UI and create a new level
        HUD.refreshUI();
        this.createLevel(HUD.currentStage);
    }

    public static finishGame()
    {
        LevelManager.gameOver();
    }

    public static destroyLevel()
    {
        for (let i = 0; i < this.powerUps.length; i++) {
            this.powerUps[i].destroy();
        }
        for (let i = 0; i < this.platforms.length; i++) {
            this.platforms[i].destroy();
        }
        this.powerUps = [];
        this.platforms = [];
    }

    private static updatePurpleInk()
    {
        this.purpleInk.Update();

        // Update the sprite
        this.camera.placeTileSpriteInScreen(this.purpleInk.topPurpleInkSprite, Math.round(this.purpleInk.risingHeight));
        this.purpleInk.bottomPurpleInkSprite.position.y = this.purpleInk.topPurpleInkSprite.bottom;
        this.purpleInk.bottomPurpleInkSprite.height = Math.max(0, this.camera.height - this.purpleInk.topPurpleInkSprite.bottom);

        if (this.purpleInk.deadHeight < this.squid.sprite.bottom) {
            this.squid.die();
            UIManager.openDialog(this.loseLifeMessage, this.retryLevelEvent);
        }
    }

    public static getLastCheckpoint(): number
    {
        // Find the last checkpoint
        for (let i = 0; i < this.checkpoints.length; i++) {
            if (HUD.currentStage >= this.checkpoints[i]) {
                return this.checkpoints[i];
            }
        }
        // Reset the hud and start from the correct checkpoint
        return 1;
    }

    private static retryLevelEvent()
    {
        LevelManager.retryLevel();
    }

    public static retryLevel()
    {
        // Remove 1 life if we still have lifes left
        if (HUD.lifes > 0) {
            HUD.addLifes(-1);
            LevelManager.reset();
        }
        // No more lifes means game over
        else {
            // Give the player the option to continue from a checkpoint stage if the current stage is passed one
            let checkpointStage = LevelManager.getLastCheckpoint();
            if (checkpointStage > 1) {
                UIManager.openOptionDialog(this.continueMessage, Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, this.gameOver);
            }
            // Skip the continue option dialog if the player hasn't passed any checkpoint stages
            else {
                UIManager.openDialog(this.gameOverMessage, this.gameOver);
            }
        }
    }

    public static gameOver(continueStage: boolean = false)
    {
        // Reset everything in the HUD and start from the correct stage
        if (continueStage) {
            HUD.reset(LevelManager.getLastCheckpoint());
        }
        else {
            HUD.reset();
        }

        // Destroy the current level and create a new one
        LevelManager.destroyLevel();
        LevelManager.createLevel(HUD.currentStage);
    }
}