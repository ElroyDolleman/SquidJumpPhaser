class PurpleInk
{
    public isRisingByDefault: boolean = true;

    private game: Phaser.Game;

    private height: number; // Determines how high the purple ink is
    public bottomPurpleInkSprite: Phaser.TileSprite;
    public topPurpleInkSprite: Phaser.TileSprite;

    public isRising: boolean = true;

    private readonly startingHeight: number = -733;
    private readonly nonMovingHeight: number = -32;
    public readonly risingSpeed: number = 55 // Pixels per second
    public readonly tileSize: number = 8;

    public get risingHeight(): number { return this.height; }

    // The squid dies if he is below this height
    public get deadHeight(): number { return this.topPurpleInkSprite.top; }

    constructor(game: Phaser.Game)
    {
        this.game = game;

        this.topPurpleInkSprite = game.add.tileSprite(0, this.startingHeight, 240, this.tileSize, 'sheet');
        this.topPurpleInkSprite.setFrame(new Phaser.Frame(0, 58, 50, this.tileSize, this.tileSize, "frame0"));

        this.bottomPurpleInkSprite = game.add.tileSprite(0, this.startingHeight, 240, 240, 'sheet');
        this.bottomPurpleInkSprite.setFrame(new Phaser.Frame(0, 68, 50, this.tileSize, this.tileSize, "frame0"));

        this.Reset();
    }

    public Reset()
    {
        this.height = this.isRising ? this.startingHeight : this.nonMovingHeight;
    }

    public Update()
    {
        if (this.isRising) {
            this.height += this.risingSpeed * GameTimer.levelDeltaTime;
        }
    }
}