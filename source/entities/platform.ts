enum PlatformType
{
    Normal = 78,
    Ice = 98,
    Moving = 48,
    Conveyor = 138,
}

class Platform
{
    public readonly tileSize = 8;
    private readonly game: Phaser.Game;

    public xGridLocation: number;
    public yGridLocation: number;
    public get worldPositionX(): number { return this.localWorldPositionX; }
    public set worldPositionX(x: number) { this.localWorldPositionX = x; this.sprite.position.x = Math.round(this.localWorldPositionX); }
    private localWorldPositionX: number;

    private platformLength: number;
    public get length(): number { return this.platformLength; }
    public sprite: Phaser.TileSprite;

    private mountedSprites: Phaser.Sprite[] = [];

    private readonly movingForceMultiplier = 50;
    private readonly conveyorTotalFrames = 8;
    private conveyorCurrentFrame = 0;
    private conveyorTimer = 0;

    private localForce: number = 0; // The amount of force that this platform applies to the squid when he lands on it
    private localMovingSpeed: number = 0; // The amount of speed the platform moves with

    public get force(): number { return this.localForce; }
    public get movingSpeed(): number { return this.localMovingSpeed; }

    public get carriesMomentum(): boolean { return this.platformType == PlatformType.Ice; }
    public get isMoving(): boolean { return this.localMovingSpeed != 0; }

    public readonly platformType: PlatformType;

    public get rightLocation() { return this.xGridLocation + this.platformLength; }
    public get yPosition() { return this.yGridLocation * this.tileSize; }
    public get hitbox() { return new Phaser.Rectangle(this.localWorldPositionX, this.sprite.position.y, this.platformLength * this.tileSize, this.tileSize); }

    constructor(game: Phaser.Game, xLocation: number, yLocation: number, length: number, platformType: PlatformType = PlatformType.Normal)
    {
        this.game = game;

        this.platformType = platformType;

        this.xGridLocation = xLocation;
        this.yGridLocation = yLocation;
        this.platformLength = length;
        
        this.sprite = game.add.tileSprite(this.xGridLocation * this.tileSize, 0, this.tileSize * length, this.tileSize, 'sheet');
        this.sprite.setFrame(new Phaser.Frame(0, platformType, 50, this.tileSize, this.tileSize, "frame0"));
        this.sprite.smoothed = false;
        
        this.localWorldPositionX = this.sprite.position.x;
    }

    public update()
    {
        // Update the movement when it is a moving platform
        if (this.platformType == PlatformType.Moving) {
            this.move(this.localMovingSpeed);

            if (this.hitbox.right >= 240-8 || this.hitbox.left <= 8) {
                this.localMovingSpeed *= -1;
            }
        }

        // Calculate and update the correct frame when it is a conveyor platform
        else if (this.platformType == PlatformType.Conveyor) {
            let deltaSpeed = this.force * GameTimer.objectsDeltaTime;
            this.conveyorTimer += Math.abs(deltaSpeed);

            if (this.conveyorTimer >= 1) {
                let frames = Math.floor(this.conveyorTimer);
                this.conveyorTimer -= frames;
                this.nextConveyorFrame(deltaSpeed > 0 ? -frames : frames);
            }

            this.applyForceToMountedSprites();
        }
    }

    // Moves the platform horizontally
    public move(speed: number)
    {
        if (this.mountedSprites.length > 0) {
            // Store the old position
            var oldPositionX = this.sprite.position.x;

            // Move the platform
            this.worldPositionX += speed * GameTimer.objectsDeltaTime;

            // Calculate how much it moved
            var movedAmount = this.sprite.position.x - oldPositionX;

            // Move every attached sprite with the same amount
            this.mountedSprites.forEach(attachedSprite => {
                attachedSprite.position.x += movedAmount;
            });
        }
        else {
            // Move the platform
            this.worldPositionX += speed * GameTimer.objectsDeltaTime;
        }
    }

    public applyForceToMountedSprites()
    {
        this.mountedSprites.forEach(attachedSprite => {
            attachedSprite.position.x += this.force * GameTimer.objectsDeltaTime;
        });
    }

    // Attach a sprite to this platform so that it moves allong with it
    public mount(sprite: Phaser.Sprite)
    {
        this.mountedSprites.push(sprite);
    }

    // Detach a sprite that is attached to this platform
    public dismount(sprite: Phaser.Sprite)
    {
        var index = this.mountedSprites.indexOf(sprite, 0);
        if (index > -1) {
            this.mountedSprites.splice(index, 1);
        }
    }

    // Goes to the next frame of the conveyor animation
    private nextConveyorFrame(amount: number = 1)
    {
        this.conveyorCurrentFrame += amount;
        if (this.conveyorCurrentFrame >= this.conveyorTotalFrames) {
            this.conveyorCurrentFrame = this.conveyorCurrentFrame % this.conveyorTotalFrames;
        }
        else if (this.conveyorCurrentFrame < 0) {
            this.conveyorCurrentFrame = (this.conveyorTotalFrames - Math.abs(this.conveyorCurrentFrame) % this.conveyorTotalFrames) % this.conveyorTotalFrames;
        }

        this.sprite.setFrame(new Phaser.Frame(0, PlatformType.Conveyor + 10 * this.conveyorCurrentFrame, 50, this.tileSize, this.tileSize, "frame0"));
    }

    public setForce(speed: number)
    {
        this.localForce = speed * this.movingForceMultiplier;
    }

    public setMovingSpeed(speed: number)
    {
        this.localMovingSpeed = speed * this.movingForceMultiplier;
    }

    public destroy()
    {
        this.sprite.destroy();
    }
}