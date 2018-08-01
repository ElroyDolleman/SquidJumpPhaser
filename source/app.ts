class SquidJumpGame extends Phaser.Game
{
    constructor()
    {
        // Setup the game
        super(432, 240, Phaser.AUTO, 'squidjump-fangame', null, false, false);

        // Adding states
        this.state.add('Loading', LoadingState, false);
        this.state.add('Game', GameState, false);

        // Start the first state
        this.state.start('Loading');
    }
}
 
window.onload = () =>
{
    var game = new SquidJumpGame();
};