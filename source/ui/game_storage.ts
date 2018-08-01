class GameStorage
{
    private static readonly highscoreKey: string = "highscore";

    public static storeHighscore(newHighScore: number) 
    {
        try {
            localStorage.setItem(this.highscoreKey, newHighScore.toString());
        }
        catch(e) { }
    }

    public static retrieveHighscore(): number
    {
        try {
            if (localStorage.getItem(this.highscoreKey) !== null) {
                return parseInt(localStorage.getItem(this.highscoreKey));
            }
        }
        catch(e) { }

        return 0;
    }
}