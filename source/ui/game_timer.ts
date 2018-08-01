class GameTimer
{
    private static game: Phaser.Game;

    private static get maxTime() { return (9 * 60 + 59) * 1000 + 999; }

    public static levelSpeed: number = 1; 
    public static playerSpeed: number = 1;
    public static objectsSpeed: number = 1;

    public static get levelDeltaTime() { return this.game.time.physicsElapsed * this.levelSpeed; };
    public static get playerDeltaTime() { return this.levelDeltaTime * this.playerSpeed; };
    public static get objectsDeltaTime() { return this.levelDeltaTime * this.objectsSpeed; };

    public static get playerDeltaTimeMiliseconds() { return this.playerDeltaTime * 1000; };
    public static get levelDeltaTimeMiliseconds() { return this.levelDeltaTime * 1000; };
    public static get objectsDeltaTimeMiliseconds() { return this.objectsDeltaTime * 1000; };

    private static timer: number = 0;

    public static get minutes(): number { return Math.floor(this.roundedTime / 60000) }
    public static get seconds(): number { return Math.floor(this.roundedTime / 1000) - this.minutes * 60; }
    public static get miliseconds(): number { return this.roundedTime - this.seconds * 1000; }

    public static get currrentTime(): number { return this.timer; }
    public static get roundedTime(): number { return Math.round(this.timer); }

    public static get minutesText(): string {
        return Math.min(this.minutes, 9).toString();
    }
    public static get secondsText(): string { 
        return ("0" + this.seconds).slice(-2);
    }
    public static get milisecondsText(): string { 
        return ("00" + this.miliseconds).slice(-3).slice(0, 2);
    }

    public static initialize(game: Phaser.Game)
    {
        this.game = game;
    }

    public static reset()
    {
        this.timer = 0;
    }

    public static update(game: Phaser.Game)
    {
        this.timer += this.levelDeltaTimeMiliseconds;
    }

    public static getStageTimerAsText(): string
    {
        return this.minutesText + ":" + this.secondsText + ":" + this.milisecondsText;
    }
}