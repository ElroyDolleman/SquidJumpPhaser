class DialogMessage
{
    private blackRect: Phaser.Graphics;
    private font: Phaser.RetroFont;
    private image: Phaser.Image;

    private width: number;
    private height: number;

    constructor(game: Phaser.Game, text: string, x: number, y: number, width: number, height: number)
    {
        this.width = width;
        this.height = height;

        this.blackRect = game.add.graphics();
        this.blackRect.lineStyle(0);
        this.blackRect.beginFill(0x000000, 1);
        this.blackRect.drawRect(x - this.width / 2, y - this.height / 2, this.width, this.height);
        this.blackRect.endFill();

        this.font = UIManager.getFont();
        this.font.align = Phaser.RetroFont.ALIGN_CENTER;
        this.font.multiLine = true
        this.font.text = text;

        this.image = game.add.image(x, y, this.font);
        this.image.anchor.set(0.5, 0.5);
    }

    destroy()
    {
        this.blackRect.destroy();
        this.image.destroy();
        this.font.destroy(true);
    }
}