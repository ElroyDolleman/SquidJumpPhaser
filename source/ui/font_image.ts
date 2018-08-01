class FontImage
{
    private font: Phaser.RetroFont;
    private image: Phaser.Image;

    constructor(game: Phaser.Game, text: string, positionX: number, positionY: number)
    {
        this.font = game.add.retroFont("sheet", 8, 10, Phaser.RetroFont.TEXT_SET2, 16, 2, 0, 3, 82);
        this.font.multiLine = true
        this.font.align = Phaser.RetroFont.ALIGN_CENTER;
        this.font.text = text;

        this.image = game.add.image(positionX, positionY, this.font);
        this.image.anchor.set(0.5, 1);
    }

    changeText(text: string)
    {
        this.font.text = text;
    }
}