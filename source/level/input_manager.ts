class InputManager
{
    public static pauseKey: Phaser.Key;
    public static confirmKey: Phaser.Key;
    public static goBackKey: Phaser.Key;
    public static jumpKey: Phaser.Key;
    public static leftKey: Phaser.Key;
    public static rightKey: Phaser.Key;
    public static cheatKey: Phaser.Key;

    public static initialize(game: Phaser.Game)
    {
        this.pauseKey = game.input.keyboard.addKey(Phaser.Keyboard.P);
        this.goBackKey = game.input.keyboard.addKey(Phaser.Keyboard.BACKSPACE);
        this.confirmKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);

        this.jumpKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);

        this.cheatKey = game.input.keyboard.addKey(Phaser.Keyboard.CAPS_LOCK);
    }
}