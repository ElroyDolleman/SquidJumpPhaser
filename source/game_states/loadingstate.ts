class LoadingState extends Phaser.State
{
    player: Phaser.Sprite;

    preload()
    {
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;
    
        this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
        this.game.scale.setUserScale(2, 2);
    
        Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);

        this.game.load.image('sheet', 'assets/squidjump_sheet.png');
        this.game.load.image('gamefont', 'assets/squidjump_sheet.png');
    }

    create()
    {
        // this.game.stage.backgroundColor = '#2d2d2d';
        // this.player = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'sheet');
        // this.player.anchor.setTo(0.5, 0.5);

        this.game.state.start('Game');
    }

    update()
    {
        
    }
}