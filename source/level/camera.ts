class Camera
{
    squid: Squid;
    yPosition: number;

    readonly height = 240;
    readonly deadZone = 184;
    
    readonly cameraStartPosition = this.deadZone - this.height - 10;

    get cameraCorrectionSpeed() { return Math.abs((this.squid.sprite.position.y - (this.groundedDeadZone)) * 3); }
    get center() { return this.height / 2; }
    // The dead zone is higher when the squid is on a platform
    get groundedDeadZone() { return this.deadZone - 2; }

    constructor(squid: Squid)
    {
        this.squid = squid;

        this.reset();
    }

    public reset()
    {
        this.yPosition = this.cameraStartPosition;

        this.squid.sprite.position.y = this.height - this.squid.hitbox.halfHeight + this.cameraStartPosition;
    }

    public update()
    {
        if (this.squid.isInAir) {
            // Move the camera to the squid if he's past the dead zone
            if (this.squid.sprite.position.y > this.deadZone) {
                this.moveCameraTo(this.deadZone);
            }
            else if (this.squid.sprite.position.y < this.deadZone) {
                let fractDist = (this.deadZone - this.squid.sprite.position.y) / this.deadZone;
                let speed = Math.max(this.squid.jumpPower * GameTimer.levelDeltaTime * fractDist, 0);

                this.moveCamera(speed * 1.2);
            }
        }
        // When the squid is on a platform, the camera will slowly move upwards if the dead zone is below the squid
        else {
            if (this.squid.sprite.position.y < this.groundedDeadZone) {
                this.moveCamera(this.cameraCorrectionSpeed * GameTimer.levelDeltaTime);
            }
            // Move the camera to the squid if he's past the dead zone (plus an offset, because the camera should be a bit lower when the squid is grounded)
            if (this.squid.sprite.position.y > this.groundedDeadZone) {
                this.moveCameraTo(this.groundedDeadZone);
            }
        }
    }

    private moveCamera(speed: number)
    {
        this.squid.sprite.position.y += speed;
        this.yPosition += speed;
    }

    private moveCameraTo(position: number)
    {
        this.moveCamera(position - this.squid.sprite.position.y);
    }

    public placeSpriteInScreen(sprite: Phaser.Sprite, worldPosY: number)
    {
        sprite.position.y = this.height - (worldPosY - this.yPosition);
    }

    public placeTileSpriteInScreen(sprite: Phaser.TileSprite, worldPosY: number)
    {
        sprite.position.y = this.height - (worldPosY - this.yPosition);
    }
}