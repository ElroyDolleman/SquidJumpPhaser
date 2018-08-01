class HUD
{
    public static get lifeSpriteSize(): Phaser.Point { return new Phaser.Point(9, 8); }
    public static get lifesUIPosition(): Phaser.Point { return new Phaser.Point(385 - (this.lifes-1) * this.lifeSpriteSize.x, 100); }

    public static readonly maxLifes: number = 4;
    public static readonly startLifes: number = 2;
    public static readonly finalStage: number = 25;

    private static font: Phaser.RetroFont;
    private static image: Phaser.Image;
    private static lifeSprite: Phaser.TileSprite;

    public static currentStage: number = 1;
    private static currentScore: number = 0;
    private static highScore: number = 0;

    private static scoreIsDisabled: boolean = false;

    public static lifes = HUD.startLifes;

    private static hudText: string;

    public static stageText: string = "STAGE"

    public static create(game: Phaser.Game)
    {
        this.font = UIManager.getFont();
        this.font.multiLine = true
        this.font.align = Phaser.RetroFont.ALIGN_CENTER;

        this.image = game.add.image(330, 24, this.font);

        this.lifeSprite = game.add.tileSprite(this.lifesUIPosition.x, this.lifesUIPosition.y, this.lifeSpriteSize.x, this.lifeSpriteSize.y, 'sheet');
        this.lifeSprite.anchor.set(1, 0);
        this.lifeSprite.setFrame(new Phaser.Frame(0, 127, 10, this.lifeSpriteSize.x, this.lifeSpriteSize.y, "frame0"));

        // Get the highscore that is stored locally
        this.highScore = GameStorage.retrieveHighscore();

        this.refreshUI();
    }

    public static addScore(points: number)
    {
        if (this.scoreIsDisabled) {
            return;
        }

        this.currentScore += points;

        if (this.currentScore > this.highScore) {
            this.updateHighScore(this.currentScore);
        }
    }

    public static updateHighScore(newHighScore: number)
    {
        this.highScore = newHighScore;

        GameStorage.storeHighscore(newHighScore);
    }

    public static disableScore()
    {
        this.currentScore = 0;
        this.scoreIsDisabled = true;
    }

    public static enableScore()
    {
        this.scoreIsDisabled = false;
    }

    public static addLifes(amount: number)
    {
        this.lifes += amount;
        this.refreshLifesSprite();
    }

    public static refreshUI()
    {
        this.hudText = "HI SCORE\n" + this.highScore + "\n\nSCORE\n" + this.currentScore + "\n\n" + this.stageText + " " + this.currentStage + "\n\n\n\n\n";
        this.refreshLifesSprite();
        this.updateTimer();
    }

    private static refreshLifesSprite()
    {
        this.lifeSprite.width = this.lifeSpriteSize.x * this.lifes;
    }

    public static updateTimer()
    {
        this.font.text = this.hudText + GameTimer.getStageTimerAsText();
    }

    public static reset(stage: number = 1)
    {
        this.lifes = this.startLifes;
        this.currentStage = stage;
        this.currentScore = 0;
        this.refreshUI();
    }
}