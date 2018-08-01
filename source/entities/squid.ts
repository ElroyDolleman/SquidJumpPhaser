enum SquidPowers
{
    None,
    DoubleJump,
    SpeedUp
}

class Squid
{
    private game: Phaser.Game;

    /* Sprite Based Properties */
    public sprite: Phaser.Sprite; // The sprite of the squid
    public sparklesEffectSprite: Phaser.Sprite; // The sparkles that are rendered on top of the squid when he gained a power

    private readonly spriteSize = 16; // The size of the squid sprite

    private currentFrame: number = 0;
    private currentSparkleFrame: number = 0;

    private readonly lastFrame = 6;
    private readonly frameOffset = 2; // The offset between the frames in the spritesheet

    private readonly redColorTint = 0xFF0000;
    private readonly orangeColorTint = 0xFFB732;

    /* Updateable Properties */
    private currentCharge: number = 0;
    private movementSpeed: number = 0;
    private fallSpeed: number = 0;
    private localJumpPower: number = 0;
    private currentPlatform: Platform;

    /* Timers */
    private jumpSquatTimer: number = 0;
    private glowTimer: number = 0;
    private dyingTimer: number = 0;
    private powerTimer: number = 0;

    jumpButton: Phaser.Key;
    leftButton: Phaser.Key;
    rightButton: Phaser.Key;

    /* Stats */
    private readonly chargeSpeed        = 0.14 * 60; // Determines how fast the squid charges
    private readonly glowChargeMax      = 7.2; // The max amount of charge. When reached the squid will start glowing
    private readonly glowChargeMin      = this.glowChargeMax * 0.6; // The amount of charge needed to go into the glow transition
    private readonly glowSpeed          = 50; // Determines how fast the glow flickering is
 
    private readonly jumpGravity        = 334; // The fall speed acceleration when jumping
    private readonly fallGravity        = 278; // The fall speed acceleration when falling
    private readonly maxFallSpeed       = 113; // The max amount of fall speed
    private readonly jumpPowerMultiplier      = 36.66; // Determines how powerful a jump is (higher jumpPower means higher jumps)
    private readonly startJumpPower     = 37; // The starting jump power, it will always at least jump with this amount of power
 
    private readonly maxMovementSpeed   = 100; // The maximum amount of speed the squid can move left and right
    private readonly minAcceleration    = 64; // The acceleration of the movement speed while charging
    private readonly maxAcceleration    = 92; // The acceleration of the movement speed when not charging
 
    private readonly dyingDuration      = 500; // The amount of time the death animation takes in miliseconds
    private readonly jumpSquatDuration  = 96; // The duration of the jump squat animation in miliseconds
    private readonly sparklesSpeed      = 100; // The speed of the sparkles animation in miliseconds
 
    /* Hitbox */
    private readonly hitboxSize         = { w : 11, h : 15 } // The size of the hitbox

    public get hitbox(): Phaser.Rectangle {
        return new Phaser.Rectangle(
            this.sprite.position.x - this.hitboxSize.w / 2, 
            this.sprite.position.y - this.hitboxSize.h / 2, 
            this.hitboxSize.w, 
            this.hitboxSize.h
        );
    }

    /* State Based Properties */
    private localDeadCheck: boolean = false;
    private localInAirCheck: boolean = false;
    private usedDoubleJump: boolean = false;

    private power: SquidPowers = SquidPowers.None;

    private get canDoubleJump(): boolean { return this.power == SquidPowers.DoubleJump; }
    private get speedUpMultiplier(): number { return this.power == SquidPowers.SpeedUp ? 2 : 1; }

    public get isCharging(): boolean { return this.currentCharge > 0; }
    public get isJumping(): boolean { return this.fallSpeed < 0; }
    public get isFalling(): boolean { return this.fallSpeed > 0; }
    public get isInAir(): boolean { return this.localInAirCheck; }
    public get isDead(): boolean { return this.localDeadCheck; }

    private get canJump(): boolean { return !this.isInAir || (this.canDoubleJump && !this.usedDoubleJump); }

    /* Speed Based Properties */
    private elapsedMiliseconds: number;
    private get elapsedSeconds(): number { return this.elapsedMiliseconds / 1000; }

    public get deltaFallSpeed(): number { return this.fallSpeed == 0 ? 0 : this.elapsedSeconds * (this.fallSpeed + this.elapsedSeconds * this.gravity / 2); }

    public get acceleration(): number {
        if (this.isCharging) {
            return this.minAcceleration;
        }
        return this.maxAcceleration;
    }
    public get deltaMovementSpeed(): number { return this.movementSpeed == 0 ? 0 : this.elapsedSeconds * (this.movementSpeed + this.elapsedSeconds * this.acceleration / 2); }

    public get jumpPower(): number { return this.localJumpPower; }
    private get gravity(): number { return this.isFalling ? this.fallGravity : this.jumpGravity }

    constructor(game: Phaser.Game)
    {
        this.game = game;

        this.sprite = game.add.sprite(0, 0, 'sheet');
        this.sprite.crop(new Phaser.Rectangle(2, 2, this.spriteSize, this.spriteSize), false);
        this.sprite.anchor.setTo(.5, .5);
        this.sprite.smoothed = false;

        this.sparklesEffectSprite = game.add.sprite(0, 0, 'sheet');
        this.sparklesEffectSprite.crop(new Phaser.Rectangle(12, 42, this.spriteSize, this.spriteSize), false);
        this.sparklesEffectSprite.anchor.setTo(.5, .5);
        this.sparklesEffectSprite.visible = false;

        this.jumpButton = InputManager.jumpKey;
        this.leftButton = InputManager.leftKey;
        this.rightButton = InputManager.rightKey;
    }

    public reset()
    {
        this.localInAirCheck = false;
        this.localJumpPower = 0;
        this.movementSpeed = 0;
        this.currentCharge = 0;
        this.power = SquidPowers.None;
        
        this.sparklesEffectSprite.visible = false;
        this.sprite.tint = 0xFFFFFF;
        this.setAnimationFrame(0);

        if (this.isDead) {
            this.localDeadCheck = false;
            this.sprite.rotation = 0;
        }
    }

    public update()
    {
        // Update the deltaTime
        this.elapsedMiliseconds = GameTimer.playerDeltaTimeMiliseconds * this.speedUpMultiplier;

        // When the squid is alive
        if (!this.isDead) {
            // Charge when the jump button is held down and the squid is allowed to charge
            if (this.jumpButton.isDown) {
                this.charge();
            }

            // When the jump button isn't held and the squid was charging
            else if (this.isCharging) {
                this.startJumping();
            }

            // When the squid is in the air
            if (this.localInAirCheck) {
                this.updateFalling();
                this.updateMovementInputs();
            }

            // Play the jump squat animation
            if (this.jumpSquatTimer > 0) {
                this.playJumpSquatAnimation();
            }

            // Updating the left and right movement
            this.sprite.position.x += this.deltaMovementSpeed;

            // Updating the platform behaviour if the squid is on a platform
            if (this.currentPlatform != undefined) {
                this.updatePlatform();
            }

            // Update the power-up behaviour if the squid has a power
            if (this.power != SquidPowers.None) {
                this.updatePower();
            }
        }
        // When the squid is dead
        else {
            this.updateDying();
        }
    }

    // Updates everything necessary for when the squid has gained a power from a power-up
    private updatePower()
    {
        if ((this.powerTimer -= GameTimer.playerDeltaTimeMiliseconds) <= 0) {
            this.power = SquidPowers.None;
            this.sparklesEffectSprite.visible = false;
        }
        else {
            this.sparklesEffectSprite.visible = true;
            this.updateSparklesAnimation();
        }
    }

    // Updating the platform behaviour for when the squid is currently standing on a platform
    private updatePlatform()
    { 
        // When the is in the air, remove the reference to the platform
        if (this.isInAir) {
            this.dismountCurrentPlatform();
            return;
        }

        // Check if the platform is still underneath the squid, if not then the squid will fall
        if (this.hitbox.right < this.currentPlatform.hitbox.left || this.hitbox.left > this.currentPlatform.hitbox.right) {
            this.localInAirCheck = true;
            this.fallSpeed = 0; // TODO: Fallspeed should be set to 0 when the squid lands on a platform

            // Set the movement speed to 0 when it doesn't carry momentum
            if (!this.currentPlatform.carriesMomentum) {
                this.movementSpeed = 0;
            }

            return;
        }        
    }

    // Calculates the jump power and starts jumping
    private startJumping()
    {
        if (this.canJump) {
            // Calculate the jumpPower
            this.localJumpPower = (this.startJumpPower + (this.currentCharge * this.jumpPowerMultiplier * 1.1));
            
            // Set fallSpeed as -jumpPower so that the squid moves upwards
            this.fallSpeed = -this.jumpPower;
            
            // Reset the movement speed when the platform doesn't carry momentum
            if (this.currentPlatform != undefined && !this.currentPlatform.carriesMomentum) {
                this.movementSpeed = 0;
            }

            // Set usedDoubleJump to true if a double jump was used
            if (this.canDoubleJump && this.isInAir) {
                this.usedDoubleJump = true;
            }

            // Squid is now in the air
            this.localInAirCheck = true;
        }
        
        // Reset the charge
        this.currentCharge = 0;
        // Calculates the starting time for the jump squat timer
        this.jumpSquatTimer = Math.max(0.1, (this.currentFrame / this.lastFrame) * this.jumpSquatDuration);
        // Reset the tint back to normal
        this.sprite.tint = 0xFFFFFF;
    }

    applyDoubleJumpPower(duration: number)
    {
        this.power = SquidPowers.DoubleJump;
        this.usedDoubleJump = false;
        this.powerTimer = duration;
    }

    applySpeedUpPower(duration: number)
    {
        this.power = SquidPowers.SpeedUp;
        this.powerTimer = duration;
    }

    updateSparklesAnimation()
    {
        let changeFrame = false;

        if ((1 + Math.floor(this.powerTimer / this.sparklesSpeed)) % 2 == 0) {
            if (this.currentSparkleFrame != 0) {
                this.currentSparkleFrame = 0;
                changeFrame = true;
            }
        }
        else {
            if (this.currentSparkleFrame != 1) {
                this.currentSparkleFrame = 1;
                changeFrame = true;
            }
        }

        if (changeFrame) {
            this.sparklesEffectSprite.crop(new Phaser.Rectangle(12 + 18 * this.currentSparkleFrame, 42, this.spriteSize, this.spriteSize), false);
        }

        this.sparklesEffectSprite.position = this.sprite.position;
    }

    public applyJumpForce(jumpForce: number)
    {
        this.localJumpPower = jumpForce;
        this.fallSpeed = -this.localJumpPower;
        this.localInAirCheck = true;
    }

    public landing(platform: Platform)
    {
        // The squid is not in the air anymore
        this.localInAirCheck = false;

        // Reset the double jump
        this.usedDoubleJump = false;

        // Check if the squid should stop moving
        if (!platform.carriesMomentum) {
            this.movementSpeed = 0;
        }

        platform.mount(this.sprite);
        this.currentPlatform = platform;
    }

    public die()
    {
        this.localDeadCheck = true;
        this.sprite.rotation = Math.PI / 2;
        this.sparklesEffectSprite.visible = false;
        this.dismountCurrentPlatform();
        this.dyingTimer = 0;
        this.setAnimationFrame(0);
    }

    private dismountCurrentPlatform()
    {
        if (this.currentPlatform == undefined) { return; }

        this.currentPlatform.dismount(this.sprite);
        this.currentPlatform = undefined;
    }

    private updateDying()
    {
        this.dyingTimer = Math.min(this.dyingTimer + this.elapsedMiliseconds, this.dyingDuration);

        this.sprite.tint = Phaser.Color.interpolateColor(0xFFFFFF, 0x000000, this.dyingDuration, this.dyingTimer, 1);
    }

    updateMovementInputs()
    {
        if (this.leftButton.isDown) {
            this.movementSpeed = Math.max(this.movementSpeed - this.acceleration * this.elapsedSeconds, -this.maxMovementSpeed * this.speedUpMultiplier);
        }
        else if (this.rightButton.isDown) {
            this.movementSpeed = Math.min(this.movementSpeed + this.acceleration * this.elapsedSeconds, this.maxMovementSpeed * this.speedUpMultiplier);
        }
    }

    updateFalling()
    {
        this.sprite.position.y += this.deltaFallSpeed;
        this.fallSpeed = Math.min(this.fallSpeed + this.gravity * this.elapsedSeconds, this.maxFallSpeed);
    }

    charge()
    {
        this.currentCharge = Math.min(this.currentCharge + this.chargeSpeed * this.elapsedSeconds, this.glowChargeMax);
    
        this.playChargeAnimation();
    }

    updatePlatformCollision(platform: Platform)
    {
        // Only check collision with platforms when the squid is not in the air
        if (!this.localInAirCheck) { return; }

        if (this.fallsOnPlatform(platform)) {
            // Place the squid on the platform
            this.sprite.bottom = platform.hitbox.top;
           
            this.landing(platform);
        }
    }

    collidesWith(otherRect: Phaser.Rectangle): boolean
    {
        return Phaser.Rectangle.intersects(otherRect, this.hitbox);
    }

    fallsOnPlatform(platform: Platform): boolean
    {
        var bottom = this.hitbox.bottom;
        var left = this.hitbox.left;
        var right = this.hitbox.right;

        return this.isFalling && (bottom >= platform.sprite.top && bottom - this.deltaFallSpeed <= platform.sprite.top && left <= platform.hitbox.right && right >= platform.hitbox.left);
    }

    updatePowerAnimation()
    {

    }

    playJumpSquatAnimation()
    {
        // Counts down the jump squat timer
        this.jumpSquatTimer = Math.max(this.jumpSquatTimer - this.elapsedMiliseconds, 0);

        // Calculate the current frame, starts at the last frame since the jump squat animation is the charge animation played backwards
        this.setAnimationFrame(
            Math.round(this.lastFrame * (this.jumpSquatTimer / this.jumpSquatDuration))
        );
    }

    playChargeAnimation()
    {
        // While the squid is still in chargeSquat animation
        if (this.currentCharge < this.glowChargeMin) {
            // Calculates the charge needed to go to the next frame
            let chargeForNextFrame = this.glowChargeMin / (this.lastFrame) * this.currentFrame;
            
            // Go to the next frame when the squid has charged enough
            if (this.currentCharge >= chargeForNextFrame) {
                this.nextAnimationFrame();
            }
        }

        // While the squid transitions to glowing
        else if (this.currentCharge < this.glowChargeMax)
        {
            // Calculate the current color interpolation
            let interpolation = this.currentCharge - this.glowChargeMin;
            // Interpolates to the color red
            this.sprite.tint = Phaser.Color.interpolateColor(0xFFFFFF, this.redColorTint, this.glowChargeMax - this.glowChargeMin, interpolation, 1);
        }

        // While the squid is glowing (happens when fully charged)
        else
        {
            this.glowTimer += this.elapsedMiliseconds;
            // Swap between red and orange to make it look like the squid is glowing
            if (this.glowTimer >= this.glowSpeed) {
                this.glowTimer -= this.glowSpeed;
                this.swapRedOrangeTint();
            }
        }
    }

    swapRedOrangeTint()
    {
        if (this.sprite.tint == this.redColorTint) {
            this.sprite.tint = this.orangeColorTint;
        }
        else {
            this.sprite.tint = this.redColorTint;
        }
    }

    setAnimationFrame(newFrame: number)
    {
        this.currentFrame = newFrame;

        // Calculate the x position in the spritesheet to crop the current frame
        this.sprite.crop(
            new Phaser.Rectangle(
                this.frameOffset + (this.spriteSize + this.frameOffset) * this.currentFrame, 
                this.frameOffset, 
                this.spriteSize, 
                this.spriteSize
            ), 
            false
        );
    }

    nextAnimationFrame() {
        this.setAnimationFrame(this.currentFrame+1);
    }

    previousAnimationFrame() {
        this.setAnimationFrame(this.currentFrame-1);
    }
}