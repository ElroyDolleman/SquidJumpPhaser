enum PowerUpTypes
{
    Zapfish = 20,
    RedFish = 128,
    JellyFish = 74,
    StarFish = 56
}

class PowerUp
{
    public readonly powerUpType: PowerUpTypes;

    public sprite: Phaser.Sprite;
    public xWorldPosition: number;
    public yWorldPosition: number;

    public static readonly spriteSize = 16;
    public static readonly redFishJumpForce = 400;
    public static readonly powerUpDuration = 10000; // Miliseconds

    public get isActive(): boolean { return this.sprite.visible; };
    public set isActive(active: boolean) { this.sprite.visible = active; };

    public get hitbox() { return new Phaser.Rectangle(this.sprite.position.x - PowerUp.spriteSize / 2, this.sprite.position.y - PowerUp.spriteSize / 2, PowerUp.spriteSize, PowerUp.spriteSize); }

    constructor(game: Phaser.Game, powerUpType: PowerUpTypes, xPosition: number, yPosition: number)
    {
        this.powerUpType = powerUpType;

        this.xWorldPosition = xPosition;
        this.yWorldPosition = yPosition;

        this.sprite = game.add.sprite(xPosition, 0, 'sheet');
        this.sprite.crop(new Phaser.Rectangle(powerUpType, 22, PowerUp.spriteSize, PowerUp.spriteSize), false);

        // Use this for grid testing
        // if (powerUpType == PowerUpTypes.StarFish) {
        //     this.Sprite.crop(new Phaser.Rectangle(127, 10, 8, 8), false);
        // }

        this.sprite.anchor.set(0.5, 0.5);
    }

    destroy()
    {
        this.sprite.destroy();
    }
}