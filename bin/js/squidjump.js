var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var SquidJumpGame = /** @class */ (function (_super) {
    __extends(SquidJumpGame, _super);
    function SquidJumpGame() {
        var _this = 
        // Setup the game
        _super.call(this, 432, 240, Phaser.AUTO, 'squidjump-fangame', null, false, false) || this;
        // Adding states
        _this.state.add('Loading', LoadingState, false);
        _this.state.add('Game', GameState, false);
        // Start the first state
        _this.state.start('Loading');
        return _this;
    }
    return SquidJumpGame;
}(Phaser.Game));
window.onload = function () {
    var game = new SquidJumpGame();
};
var PlatformType;
(function (PlatformType) {
    PlatformType[PlatformType["Normal"] = 78] = "Normal";
    PlatformType[PlatformType["Ice"] = 98] = "Ice";
    PlatformType[PlatformType["Moving"] = 48] = "Moving";
    PlatformType[PlatformType["Conveyor"] = 138] = "Conveyor";
})(PlatformType || (PlatformType = {}));
var Platform = /** @class */ (function () {
    function Platform(game, xLocation, yLocation, length, platformType) {
        if (platformType === void 0) { platformType = PlatformType.Normal; }
        this.tileSize = 8;
        this.mountedSprites = [];
        this.movingForceMultiplier = 50;
        this.conveyorTotalFrames = 8;
        this.conveyorCurrentFrame = 0;
        this.conveyorTimer = 0;
        this.localForce = 0; // The amount of force that this platform applies to the squid when he lands on it
        this.localMovingSpeed = 0; // The amount of speed the platform moves with
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
    Object.defineProperty(Platform.prototype, "worldPositionX", {
        get: function () { return this.localWorldPositionX; },
        set: function (x) { this.localWorldPositionX = x; this.sprite.position.x = Math.round(this.localWorldPositionX); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Platform.prototype, "length", {
        get: function () { return this.platformLength; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Platform.prototype, "force", {
        get: function () { return this.localForce; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Platform.prototype, "movingSpeed", {
        get: function () { return this.localMovingSpeed; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Platform.prototype, "carriesMomentum", {
        get: function () { return this.platformType == PlatformType.Ice; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Platform.prototype, "isMoving", {
        get: function () { return this.localMovingSpeed != 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Platform.prototype, "rightLocation", {
        get: function () { return this.xGridLocation + this.platformLength; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Platform.prototype, "yPosition", {
        get: function () { return this.yGridLocation * this.tileSize; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Platform.prototype, "hitbox", {
        get: function () { return new Phaser.Rectangle(this.localWorldPositionX, this.sprite.position.y, this.platformLength * this.tileSize, this.tileSize); },
        enumerable: true,
        configurable: true
    });
    Platform.prototype.update = function () {
        // Update the movement when it is a moving platform
        if (this.platformType == PlatformType.Moving) {
            this.move(this.localMovingSpeed);
            if (this.hitbox.right >= 240 - 8 || this.hitbox.left <= 8) {
                this.localMovingSpeed *= -1;
            }
        }
        // Calculate and update the correct frame when it is a conveyor platform
        else if (this.platformType == PlatformType.Conveyor) {
            var deltaSpeed = this.force * GameTimer.objectsDeltaTime;
            this.conveyorTimer += Math.abs(deltaSpeed);
            if (this.conveyorTimer >= 1) {
                var frames_1 = Math.floor(this.conveyorTimer);
                this.conveyorTimer -= frames_1;
                this.nextConveyorFrame(deltaSpeed > 0 ? -frames_1 : frames_1);
            }
            this.applyForceToMountedSprites();
        }
    };
    // Moves the platform horizontally
    Platform.prototype.move = function (speed) {
        if (this.mountedSprites.length > 0) {
            // Store the old position
            var oldPositionX = this.sprite.position.x;
            // Move the platform
            this.worldPositionX += speed * GameTimer.objectsDeltaTime;
            // Calculate how much it moved
            var movedAmount = this.sprite.position.x - oldPositionX;
            // Move every attached sprite with the same amount
            this.mountedSprites.forEach(function (attachedSprite) {
                attachedSprite.position.x += movedAmount;
            });
        }
        else {
            // Move the platform
            this.worldPositionX += speed * GameTimer.objectsDeltaTime;
        }
    };
    Platform.prototype.applyForceToMountedSprites = function () {
        var _this = this;
        this.mountedSprites.forEach(function (attachedSprite) {
            attachedSprite.position.x += _this.force * GameTimer.objectsDeltaTime;
        });
    };
    // Attach a sprite to this platform so that it moves allong with it
    Platform.prototype.mount = function (sprite) {
        this.mountedSprites.push(sprite);
    };
    // Detach a sprite that is attached to this platform
    Platform.prototype.dismount = function (sprite) {
        var index = this.mountedSprites.indexOf(sprite, 0);
        if (index > -1) {
            this.mountedSprites.splice(index, 1);
        }
    };
    // Goes to the next frame of the conveyor animation
    Platform.prototype.nextConveyorFrame = function (amount) {
        if (amount === void 0) { amount = 1; }
        this.conveyorCurrentFrame += amount;
        if (this.conveyorCurrentFrame >= this.conveyorTotalFrames) {
            this.conveyorCurrentFrame = this.conveyorCurrentFrame % this.conveyorTotalFrames;
        }
        else if (this.conveyorCurrentFrame < 0) {
            this.conveyorCurrentFrame = (this.conveyorTotalFrames - Math.abs(this.conveyorCurrentFrame) % this.conveyorTotalFrames) % this.conveyorTotalFrames;
        }
        this.sprite.setFrame(new Phaser.Frame(0, PlatformType.Conveyor + 10 * this.conveyorCurrentFrame, 50, this.tileSize, this.tileSize, "frame0"));
    };
    Platform.prototype.setForce = function (speed) {
        this.localForce = speed * this.movingForceMultiplier;
    };
    Platform.prototype.setMovingSpeed = function (speed) {
        this.localMovingSpeed = speed * this.movingForceMultiplier;
    };
    Platform.prototype.destroy = function () {
        this.sprite.destroy();
    };
    return Platform;
}());
var PowerUpTypes;
(function (PowerUpTypes) {
    PowerUpTypes[PowerUpTypes["Zapfish"] = 20] = "Zapfish";
    PowerUpTypes[PowerUpTypes["RedFish"] = 128] = "RedFish";
    PowerUpTypes[PowerUpTypes["JellyFish"] = 74] = "JellyFish";
    PowerUpTypes[PowerUpTypes["StarFish"] = 56] = "StarFish";
})(PowerUpTypes || (PowerUpTypes = {}));
var PowerUp = /** @class */ (function () {
    function PowerUp(game, powerUpType, xPosition, yPosition) {
        this.powerUpType = powerUpType;
        this.xWorldPosition = xPosition;
        this.yWorldPosition = yPosition;
        this.sprite = game.add.sprite(xPosition, 0, 'sheet');
        this.sprite.crop(new Phaser.Rectangle(powerUpType, 22, PowerUp.spriteSize, PowerUp.spriteSize), false);
        // Use this for grid testing
        // if (powerUpType == PowerUpTypes.StarFish) {
        //     this.Sprite.crop(new Phaser.Rectangle(127, 10, 8, 8), false);
        // }
        this.sprite.anchor.set(0.5, 0.5);
    }
    Object.defineProperty(PowerUp.prototype, "isActive", {
        get: function () { return this.sprite.visible; },
        set: function (active) { this.sprite.visible = active; },
        enumerable: true,
        configurable: true
    });
    ;
    ;
    Object.defineProperty(PowerUp.prototype, "hitbox", {
        get: function () { return new Phaser.Rectangle(this.sprite.position.x - PowerUp.spriteSize / 2, this.sprite.position.y - PowerUp.spriteSize / 2, PowerUp.spriteSize, PowerUp.spriteSize); },
        enumerable: true,
        configurable: true
    });
    PowerUp.prototype.destroy = function () {
        this.sprite.destroy();
    };
    PowerUp.spriteSize = 16;
    PowerUp.redFishJumpForce = 400;
    PowerUp.powerUpDuration = 10000; // Miliseconds
    return PowerUp;
}());
var SquidPowers;
(function (SquidPowers) {
    SquidPowers[SquidPowers["None"] = 0] = "None";
    SquidPowers[SquidPowers["DoubleJump"] = 1] = "DoubleJump";
    SquidPowers[SquidPowers["SpeedUp"] = 2] = "SpeedUp";
})(SquidPowers || (SquidPowers = {}));
var Squid = /** @class */ (function () {
    function Squid(game) {
        this.spriteSize = 16; // The size of the squid sprite
        this.currentFrame = 0;
        this.currentSparkleFrame = 0;
        this.lastFrame = 6;
        this.frameOffset = 2; // The offset between the frames in the spritesheet
        this.redColorTint = 0xFF0000;
        this.orangeColorTint = 0xFFB732;
        /* Updateable Properties */
        this.currentCharge = 0;
        this.movementSpeed = 0;
        this.fallSpeed = 0;
        this.localJumpPower = 0;
        /* Timers */
        this.jumpSquatTimer = 0;
        this.glowTimer = 0;
        this.dyingTimer = 0;
        this.powerTimer = 0;
        /* Stats */
        this.chargeSpeed = 0.14 * 60; // Determines how fast the squid charges
        this.glowChargeMax = 7.2; // The max amount of charge. When reached the squid will start glowing
        this.glowChargeMin = this.glowChargeMax * 0.6; // The amount of charge needed to go into the glow transition
        this.glowSpeed = 50; // Determines how fast the glow flickering is
        this.jumpGravity = 334; // The fall speed acceleration when jumping
        this.fallGravity = 278; // The fall speed acceleration when falling
        this.maxFallSpeed = 113; // The max amount of fall speed
        this.jumpPowerMultiplier = 36.66; // Determines how powerful a jump is (higher jumpPower means higher jumps)
        this.startJumpPower = 37; // The starting jump power, it will always at least jump with this amount of power
        this.maxMovementSpeed = 100; // The maximum amount of speed the squid can move left and right
        this.minAcceleration = 64; // The acceleration of the movement speed while charging
        this.maxAcceleration = 92; // The acceleration of the movement speed when not charging
        this.dyingDuration = 500; // The amount of time the death animation takes in miliseconds
        this.jumpSquatDuration = 96; // The duration of the jump squat animation in miliseconds
        this.sparklesSpeed = 100; // The speed of the sparkles animation in miliseconds
        /* Hitbox */
        this.hitboxSize = { w: 11, h: 15 }; // The size of the hitbox
        /* State Based Properties */
        this.localDeadCheck = false;
        this.localInAirCheck = false;
        this.usedDoubleJump = false;
        this.power = SquidPowers.None;
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
    Object.defineProperty(Squid.prototype, "hitbox", {
        get: function () {
            return new Phaser.Rectangle(this.sprite.position.x - this.hitboxSize.w / 2, this.sprite.position.y - this.hitboxSize.h / 2, this.hitboxSize.w, this.hitboxSize.h);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Squid.prototype, "canDoubleJump", {
        get: function () { return this.power == SquidPowers.DoubleJump; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Squid.prototype, "speedUpMultiplier", {
        get: function () { return this.power == SquidPowers.SpeedUp ? 2 : 1; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Squid.prototype, "isCharging", {
        get: function () { return this.currentCharge > 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Squid.prototype, "isJumping", {
        get: function () { return this.fallSpeed < 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Squid.prototype, "isFalling", {
        get: function () { return this.fallSpeed > 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Squid.prototype, "isInAir", {
        get: function () { return this.localInAirCheck; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Squid.prototype, "isDead", {
        get: function () { return this.localDeadCheck; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Squid.prototype, "canJump", {
        get: function () { return !this.isInAir || (this.canDoubleJump && !this.usedDoubleJump); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Squid.prototype, "elapsedSeconds", {
        get: function () { return this.elapsedMiliseconds / 1000; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Squid.prototype, "deltaFallSpeed", {
        get: function () { return this.fallSpeed == 0 ? 0 : this.elapsedSeconds * (this.fallSpeed + this.elapsedSeconds * this.gravity / 2); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Squid.prototype, "acceleration", {
        get: function () {
            if (this.isCharging) {
                return this.minAcceleration;
            }
            return this.maxAcceleration;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Squid.prototype, "deltaMovementSpeed", {
        get: function () { return this.movementSpeed == 0 ? 0 : this.elapsedSeconds * (this.movementSpeed + this.elapsedSeconds * this.acceleration / 2); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Squid.prototype, "jumpPower", {
        get: function () { return this.localJumpPower; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Squid.prototype, "gravity", {
        get: function () { return this.isFalling ? this.fallGravity : this.jumpGravity; },
        enumerable: true,
        configurable: true
    });
    Squid.prototype.reset = function () {
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
    };
    Squid.prototype.update = function () {
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
    };
    // Updates everything necessary for when the squid has gained a power from a power-up
    Squid.prototype.updatePower = function () {
        if ((this.powerTimer -= GameTimer.playerDeltaTimeMiliseconds) <= 0) {
            this.power = SquidPowers.None;
            this.sparklesEffectSprite.visible = false;
        }
        else {
            this.sparklesEffectSprite.visible = true;
            this.updateSparklesAnimation();
        }
    };
    // Updating the platform behaviour for when the squid is currently standing on a platform
    Squid.prototype.updatePlatform = function () {
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
    };
    // Calculates the jump power and starts jumping
    Squid.prototype.startJumping = function () {
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
    };
    Squid.prototype.applyDoubleJumpPower = function (duration) {
        this.power = SquidPowers.DoubleJump;
        this.usedDoubleJump = false;
        this.powerTimer = duration;
    };
    Squid.prototype.applySpeedUpPower = function (duration) {
        this.power = SquidPowers.SpeedUp;
        this.powerTimer = duration;
    };
    Squid.prototype.updateSparklesAnimation = function () {
        var changeFrame = false;
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
    };
    Squid.prototype.applyJumpForce = function (jumpForce) {
        this.localJumpPower = jumpForce;
        this.fallSpeed = -this.localJumpPower;
        this.localInAirCheck = true;
    };
    Squid.prototype.landing = function (platform) {
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
    };
    Squid.prototype.die = function () {
        this.localDeadCheck = true;
        this.sprite.rotation = Math.PI / 2;
        this.sparklesEffectSprite.visible = false;
        this.dismountCurrentPlatform();
        this.dyingTimer = 0;
        this.setAnimationFrame(0);
    };
    Squid.prototype.dismountCurrentPlatform = function () {
        if (this.currentPlatform == undefined) {
            return;
        }
        this.currentPlatform.dismount(this.sprite);
        this.currentPlatform = undefined;
    };
    Squid.prototype.updateDying = function () {
        this.dyingTimer = Math.min(this.dyingTimer + this.elapsedMiliseconds, this.dyingDuration);
        this.sprite.tint = Phaser.Color.interpolateColor(0xFFFFFF, 0x000000, this.dyingDuration, this.dyingTimer, 1);
    };
    Squid.prototype.updateMovementInputs = function () {
        if (this.leftButton.isDown) {
            this.movementSpeed = Math.max(this.movementSpeed - this.acceleration * this.elapsedSeconds, -this.maxMovementSpeed * this.speedUpMultiplier);
        }
        else if (this.rightButton.isDown) {
            this.movementSpeed = Math.min(this.movementSpeed + this.acceleration * this.elapsedSeconds, this.maxMovementSpeed * this.speedUpMultiplier);
        }
    };
    Squid.prototype.updateFalling = function () {
        this.sprite.position.y += this.deltaFallSpeed;
        this.fallSpeed = Math.min(this.fallSpeed + this.gravity * this.elapsedSeconds, this.maxFallSpeed);
    };
    Squid.prototype.charge = function () {
        this.currentCharge = Math.min(this.currentCharge + this.chargeSpeed * this.elapsedSeconds, this.glowChargeMax);
        this.playChargeAnimation();
    };
    Squid.prototype.updatePlatformCollision = function (platform) {
        // Only check collision with platforms when the squid is not in the air
        if (!this.localInAirCheck) {
            return;
        }
        if (this.fallsOnPlatform(platform)) {
            // Place the squid on the platform
            this.sprite.bottom = platform.hitbox.top;
            this.landing(platform);
        }
    };
    Squid.prototype.collidesWith = function (otherRect) {
        return Phaser.Rectangle.intersects(otherRect, this.hitbox);
    };
    Squid.prototype.fallsOnPlatform = function (platform) {
        var bottom = this.hitbox.bottom;
        var left = this.hitbox.left;
        var right = this.hitbox.right;
        return this.isFalling && (bottom >= platform.sprite.top && bottom - this.deltaFallSpeed <= platform.sprite.top && left <= platform.hitbox.right && right >= platform.hitbox.left);
    };
    Squid.prototype.updatePowerAnimation = function () {
    };
    Squid.prototype.playJumpSquatAnimation = function () {
        // Counts down the jump squat timer
        this.jumpSquatTimer = Math.max(this.jumpSquatTimer - this.elapsedMiliseconds, 0);
        // Calculate the current frame, starts at the last frame since the jump squat animation is the charge animation played backwards
        this.setAnimationFrame(Math.round(this.lastFrame * (this.jumpSquatTimer / this.jumpSquatDuration)));
    };
    Squid.prototype.playChargeAnimation = function () {
        // While the squid is still in chargeSquat animation
        if (this.currentCharge < this.glowChargeMin) {
            // Calculates the charge needed to go to the next frame
            var chargeForNextFrame = this.glowChargeMin / (this.lastFrame) * this.currentFrame;
            // Go to the next frame when the squid has charged enough
            if (this.currentCharge >= chargeForNextFrame) {
                this.nextAnimationFrame();
            }
        }
        // While the squid transitions to glowing
        else if (this.currentCharge < this.glowChargeMax) {
            // Calculate the current color interpolation
            var interpolation = this.currentCharge - this.glowChargeMin;
            // Interpolates to the color red
            this.sprite.tint = Phaser.Color.interpolateColor(0xFFFFFF, this.redColorTint, this.glowChargeMax - this.glowChargeMin, interpolation, 1);
        }
        // While the squid is glowing (happens when fully charged)
        else {
            this.glowTimer += this.elapsedMiliseconds;
            // Swap between red and orange to make it look like the squid is glowing
            if (this.glowTimer >= this.glowSpeed) {
                this.glowTimer -= this.glowSpeed;
                this.swapRedOrangeTint();
            }
        }
    };
    Squid.prototype.swapRedOrangeTint = function () {
        if (this.sprite.tint == this.redColorTint) {
            this.sprite.tint = this.orangeColorTint;
        }
        else {
            this.sprite.tint = this.redColorTint;
        }
    };
    Squid.prototype.setAnimationFrame = function (newFrame) {
        this.currentFrame = newFrame;
        // Calculate the x position in the spritesheet to crop the current frame
        this.sprite.crop(new Phaser.Rectangle(this.frameOffset + (this.spriteSize + this.frameOffset) * this.currentFrame, this.frameOffset, this.spriteSize, this.spriteSize), false);
    };
    Squid.prototype.nextAnimationFrame = function () {
        this.setAnimationFrame(this.currentFrame + 1);
    };
    Squid.prototype.previousAnimationFrame = function () {
        this.setAnimationFrame(this.currentFrame - 1);
    };
    return Squid;
}());
var GameState = /** @class */ (function (_super) {
    __extends(GameState, _super);
    function GameState() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.holdDurationToActivateCheats = 5000; // Miliseconds
        return _this;
    }
    GameState.prototype.preload = function () {
    };
    GameState.prototype.create = function () {
        GameTimer.initialize(this.game);
        InputManager.initialize(this.game);
        LevelManager.initialize(this.game);
        UIManager.create(this.game);
        if (GameState.gameIsPaused) {
            this.showPauseMenu();
        }
        this.game.stage.smoothed = false;
    };
    GameState.prototype.update = function () {
        // Update the UI
        UIManager.update();
        if (GameState.gameIsPaused) {
            // Check if the player activates/deactivates cheats
            if (!Cheats.canUseCheats && InputManager.cheatKey.duration > this.holdDurationToActivateCheats) {
                UIManager.closeDialog();
                this.closePauseMenu();
                Cheats.activateCheats(this.game);
            }
            // Restart the game if the player presses the goBackKey
            if (InputManager.goBackKey.downDuration(30)) {
                UIManager.closeDialog();
                this.closePauseMenu();
                LevelManager.gameOver();
            }
        }
        // Check if the player just paused the game
        if (InputManager.pauseKey.justDown && !UIManager.dialogIsOpen) {
            this.showPauseMenu();
        }
        // Update the cheat codes check
        Cheats.update(this.game);
        // Update the level if the game is not paused
        LevelManager.update();
    };
    GameState.prototype.showPauseMenu = function () {
        UIManager.showTransparentOverlay(0, 0.4);
        UIManager.openDialog("PAUSE\n\nPRESS P TO CONTINUE\n\nPRESS BACKSPACE TO RESTART", this.closePauseMenu, InputManager.pauseKey, 220, 80);
        GameState.gameIsPaused = true;
    };
    GameState.prototype.closePauseMenu = function () {
        UIManager.hideTransparentOverlay();
        GameState.gameIsPaused = false;
    };
    GameState.gameIsPaused = true;
    return GameState;
}(Phaser.State));
var LoadingState = /** @class */ (function (_super) {
    __extends(LoadingState, _super);
    function LoadingState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LoadingState.prototype.preload = function () {
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;
        this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
        this.game.scale.setUserScale(2, 2);
        Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
        this.game.load.image('sheet', 'assets/squidjump_sheet.png');
        this.game.load.image('gamefont', 'assets/squidjump_sheet.png');
    };
    LoadingState.prototype.create = function () {
        // this.game.stage.backgroundColor = '#2d2d2d';
        // this.player = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'sheet');
        // this.player.anchor.setTo(0.5, 0.5);
        this.game.state.start('Game');
    };
    LoadingState.prototype.update = function () {
    };
    return LoadingState;
}(Phaser.State));
var Camera = /** @class */ (function () {
    function Camera(squid) {
        this.height = 240;
        this.deadZone = 184;
        this.cameraStartPosition = this.deadZone - this.height - 10;
        this.squid = squid;
        this.reset();
    }
    Object.defineProperty(Camera.prototype, "cameraCorrectionSpeed", {
        get: function () { return Math.abs((this.squid.sprite.position.y - (this.groundedDeadZone)) * 3); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Camera.prototype, "center", {
        get: function () { return this.height / 2; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Camera.prototype, "groundedDeadZone", {
        // The dead zone is higher when the squid is on a platform
        get: function () { return this.deadZone - 2; },
        enumerable: true,
        configurable: true
    });
    Camera.prototype.reset = function () {
        this.yPosition = this.cameraStartPosition;
        this.squid.sprite.position.y = this.height - this.squid.hitbox.halfHeight + this.cameraStartPosition;
    };
    Camera.prototype.update = function () {
        if (this.squid.isInAir) {
            // Move the camera to the squid if he's past the dead zone
            if (this.squid.sprite.position.y > this.deadZone) {
                this.moveCameraTo(this.deadZone);
            }
            else if (this.squid.sprite.position.y < this.deadZone) {
                var fractDist = (this.deadZone - this.squid.sprite.position.y) / this.deadZone;
                var speed = Math.max(this.squid.jumpPower * GameTimer.levelDeltaTime * fractDist, 0);
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
    };
    Camera.prototype.moveCamera = function (speed) {
        this.squid.sprite.position.y += speed;
        this.yPosition += speed;
    };
    Camera.prototype.moveCameraTo = function (position) {
        this.moveCamera(position - this.squid.sprite.position.y);
    };
    Camera.prototype.placeSpriteInScreen = function (sprite, worldPosY) {
        sprite.position.y = this.height - (worldPosY - this.yPosition);
    };
    Camera.prototype.placeTileSpriteInScreen = function (sprite, worldPosY) {
        sprite.position.y = this.height - (worldPosY - this.yPosition);
    };
    return Camera;
}());
var Cheats = /** @class */ (function () {
    function Cheats() {
    }
    Object.defineProperty(Cheats, "hasUsedCheats", {
        get: function () { return this.localCheatUsedCheck; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cheats, "canUseCheats", {
        get: function () { return this.localCanUseCheats; },
        enumerable: true,
        configurable: true
    });
    Cheats.activateCheats = function (game) {
        game.input.keyboard.onDownCallback = this.onKeyPress;
        this.localCanUseCheats = true;
    };
    Cheats.update = function (game) {
        if (!this.canUseCheats) {
            return;
        }
        this.keyCommandsTimer += game.time.physicsElapsedMS;
        if (this.keyCommandsTimer >= this.keyCommandsInterval) {
            this.keyCommandsTimer = 0;
            this.currentCommands = [];
        }
    };
    Cheats.onKeyPress = function (e) {
        if (Cheats.currentCommands.length < Cheats.maxCommands) {
            Cheats.currentCommands.push(e.keyCode);
        }
        Cheats.keyCommandsTimer = 0;
        if (Cheats.compareCommandsWithCheat(Cheats.jellyPowerCheat)) {
            // Applies double jump power for a minute
            LevelManager.squid.applyDoubleJumpPower(60000);
            HUD.refreshUI();
            console.log("Double Jump Activated");
        }
        else if (Cheats.compareCommandsWithCheat(Cheats.stopPurpleInkPowerCheat)) {
            // Stops the purple ink from rising, or makes it start rising if it was already stopped
            LevelManager.purpleInk.isRisingByDefault = !LevelManager.purpleInk.isRisingByDefault;
            LevelManager.purpleInk.isRising = LevelManager.purpleInk.isRisingByDefault;
            HUD.refreshUI();
            console.log("Purple Ink Stopped");
        }
        else if (Cheats.compareCommandsWithCheat(Cheats.maxLifesCheat)) {
            HUD.lifes = HUD.maxLifes;
            HUD.refreshUI();
            console.log("Max Lifes");
        }
        else if (Cheats.compareCommandsWithCheat(Cheats.zeroLifesCheat)) {
            HUD.lifes = 0;
            HUD.refreshUI();
            console.log("No Lifes");
        }
        else if (Cheats.compareCommandsWithCheat(Cheats.nextStageCheat)) {
            LevelManager.nextLevel();
            console.log("Next Stage");
        }
        else if (Cheats.compareCommandsWithCheat(Cheats.stopObjectsCheat)) {
            GameTimer.objectsSpeed = 0;
            console.log("Stopped Level Objects");
        }
        else if (Cheats.compareCommandsWithCheat(Cheats.slowMotionCheat)) {
            GameTimer.levelSpeed = 0.5;
            console.log("Slow Motion");
        }
        else if (Cheats.compareCommandsWithCheat(Cheats.speedUpCheat)) {
            GameTimer.levelSpeed = 2;
            console.log("Speed Up");
        }
    };
    Cheats.compareCommandsWithCheat = function (cheatCommands) {
        if (cheatCommands.length != this.currentCommands.length) {
            return false;
        }
        for (var i = 0; i < cheatCommands.length; i++) {
            if (cheatCommands[i] != this.currentCommands[i]) {
                return false;
            }
        }
        // Reset the commands
        this.currentCommands = [];
        // Using cheats will prevent the player from scoring any points
        HUD.disableScore();
        // The player has used a cheat
        this.localCheatUsedCheck = true;
        return true;
    };
    Cheats.keyCommandsInterval = 300; // Miliseconds
    Cheats.maxCommands = 13;
    Cheats.jellyPowerCheat = [Phaser.Keyboard.J, Phaser.Keyboard.E, Phaser.Keyboard.L, Phaser.Keyboard.L, Phaser.Keyboard.Y];
    Cheats.stopPurpleInkPowerCheat = [Phaser.Keyboard.W, Phaser.Keyboard.A, Phaser.Keyboard.T, Phaser.Keyboard.E, Phaser.Keyboard.R];
    Cheats.maxLifesCheat = [Phaser.Keyboard.L, Phaser.Keyboard.I, Phaser.Keyboard.F, Phaser.Keyboard.E, Phaser.Keyboard.S];
    Cheats.zeroLifesCheat = [Phaser.Keyboard.D, Phaser.Keyboard.E, Phaser.Keyboard.A, Phaser.Keyboard.D];
    Cheats.nextStageCheat = [Phaser.Keyboard.N, Phaser.Keyboard.E, Phaser.Keyboard.X, Phaser.Keyboard.T];
    Cheats.stopObjectsCheat = [Phaser.Keyboard.S, Phaser.Keyboard.T, Phaser.Keyboard.O, Phaser.Keyboard.P];
    Cheats.slowMotionCheat = [Phaser.Keyboard.S, Phaser.Keyboard.L, Phaser.Keyboard.O, Phaser.Keyboard.W];
    Cheats.speedUpCheat = [Phaser.Keyboard.F, Phaser.Keyboard.A, Phaser.Keyboard.S, Phaser.Keyboard.T];
    Cheats.currentCommands = [];
    Cheats.localCanUseCheats = false;
    Cheats.localCheatUsedCheck = false;
    return Cheats;
}());
var InputManager = /** @class */ (function () {
    function InputManager() {
    }
    InputManager.initialize = function (game) {
        this.pauseKey = game.input.keyboard.addKey(Phaser.Keyboard.P);
        this.goBackKey = game.input.keyboard.addKey(Phaser.Keyboard.BACKSPACE);
        this.confirmKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        this.jumpKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        this.cheatKey = game.input.keyboard.addKey(Phaser.Keyboard.CAPS_LOCK);
    };
    return InputManager;
}());
var LevelGenerator = /** @class */ (function () {
    function LevelGenerator() {
    }
    Object.defineProperty(LevelGenerator, "gridLength", {
        get: function () { return this.rightBorder - this.leftBorder; },
        enumerable: true,
        configurable: true
    });
    LevelGenerator.generateLevel = function (game, currentStage) {
        this.redFishAmount = 0;
        this.jellyFishAmount = 0;
        this.starFishAmount = 0;
        this.icePlatformsAmountMin = 0;
        this.icePlatformsAmountMax = 0;
        this.movingPlatformsAmountMin = 0;
        this.movingPlatformsAmountMax = 0;
        this.conveyorPlatformsAmountMin = 0;
        this.conveyorPlatformsAmountMax = 0;
        this.excludedGridIndices = new Array();
        this.setLevelData(currentStage);
        this.generatePlatforms(game);
    };
    LevelGenerator.generatePlatforms = function (game) {
        // Create the ground
        var lastPlatform = new Platform(game, 0, 0, this.levelLength);
        LevelManager.addPlatform(lastPlatform);
        var platformIndices = Array.apply(null, { length: this.platformsAmount }).map(Function.call, Number);
        ;
        var icePlatforms = new Array();
        var movingPlatforms = new Array();
        var conveyorPlatforms = new Array();
        // Determines which platforms are going to be ice, and how many ice platforms there will be
        var icePlatformsAmount = this.icePlatformsAmountMax > 0 ? game.rnd.integerInRange(this.icePlatformsAmountMin, this.icePlatformsAmountMax) : 0;
        for (var i = 0; i < icePlatformsAmount; i++) {
            var index = game.rnd.integerInRange(0, platformIndices.length - 1);
            icePlatforms.push(platformIndices[index]);
            platformIndices.splice(index, 1);
        }
        // Determines which platforms are moving, and how many moving platforms there will be
        var movingPlatformsAmount = this.movingPlatformsAmountMax > 0 ? game.rnd.integerInRange(this.movingPlatformsAmountMin, this.movingPlatformsAmountMax) : 0;
        for (var i = 0; i < movingPlatformsAmount; i++) {
            var index = game.rnd.integerInRange(0, platformIndices.length - 1);
            movingPlatforms.push(platformIndices[index]);
            platformIndices.splice(index, 1);
        }
        // Determines which platforms are moving, and how many moving platforms there will be
        var conveyorPlatformsAmount = this.conveyorPlatformsAmountMax > 0 ? game.rnd.integerInRange(this.conveyorPlatformsAmountMin, this.conveyorPlatformsAmountMax) : 0;
        for (var i = 0; i < conveyorPlatformsAmount; i++) {
            var index = game.rnd.integerInRange(0, platformIndices.length - 1);
            conveyorPlatforms.push(platformIndices[index]);
            platformIndices.splice(index, 1);
        }
        for (var i = 0; i < this.platformsAmount; i++) {
            // Platform gets a random length
            var length_1 = game.rnd.integerInRange(this.platformLengthMin, this.platformLengthMax);
            // Platform is placed at a random x location
            var xLoc = game.rnd.integerInRange(this.leftBorder, this.rightBorder - length_1);
            // Platform is placed at a random heigh from the previous one
            var yLoc = 1 + lastPlatform.yGridLocation + game.rnd.integerInRange(this.platformYOffsetMin, this.platformYOffsetMax);
            // Check which type of platform there will be generated
            var platformType = PlatformType.Normal;
            if (icePlatforms.indexOf(i) > -1) {
                platformType = PlatformType.Ice;
                // If the ice platform is small, make sure to move it close to the previous platform, or the level will be unbeatable
                if (length_1 < 6 && i > 0) {
                    xLoc = this.getCloseXLocationToPlatform(lastPlatform, xLoc, length_1);
                }
            }
            else if (movingPlatforms.indexOf(i) > -1) {
                platformType = PlatformType.Moving;
            }
            else if (conveyorPlatforms.indexOf(i) > -1) {
                platformType = PlatformType.Conveyor;
                // Makes sure to put fast small conveyors close to each other
                if (length_1 < 5 && i > 0 && lastPlatform.platformType == PlatformType.Conveyor) {
                    // Check if there are fast conveyors
                    var conveyorsAreFast = false;
                    for (var i_1 = 0; i_1 < this.conveyorSpeedValues.length; i_1++) {
                        if (Math.abs(this.conveyorSpeedValues[i_1]) > 2) {
                            conveyorsAreFast = true;
                            break;
                        }
                    }
                    if (conveyorsAreFast) {
                        xLoc = this.getCloseXLocationToPlatform(lastPlatform, xLoc, length_1);
                    }
                }
            }
            // Add a new platform to the level
            LevelManager.addPlatform(lastPlatform = new Platform(game, xLoc, yLoc, length_1, platformType));
            // Set extra values for special platforms
            if (platformType == PlatformType.Moving) {
                lastPlatform.setMovingSpeed(this.movingPlatformSpeed);
            }
            else if (platformType == PlatformType.Conveyor) {
                // Choose a random force for the conveyor platforms
                lastPlatform.setForce(this.conveyorSpeedValues[game.rnd.integerInRange(0, this.conveyorSpeedValues.length - 1)]);
            }
            // Store the location of the highest platform
            if (i == this.platformsAmount - 1) {
                this.highestYPosition = lastPlatform.yPosition;
            }
        }
        // Add all the power-ups to the level
        this.generatePowerUps(game, PowerUpTypes.JellyFish, this.jellyFishAmount);
        this.generatePowerUps(game, PowerUpTypes.RedFish, this.redFishAmount);
        this.generatePowerUps(game, PowerUpTypes.StarFish, this.starFishAmount);
        LevelManager.addPowerUp(new PowerUp(game, PowerUpTypes.Zapfish, this.levelLength * 8 / 2, lastPlatform.yPosition + (game.rnd.integerInRange(this.platformYOffsetMin, this.platformYOffsetMax) * 8)));
    };
    LevelGenerator.getCloseXLocationToPlatform = function (previousPlatform, currentXLoc, currentLength) {
        if (previousPlatform.xGridLocation == this.leftBorder) {
            currentXLoc = this.rightBorder - currentLength;
        }
        else if (previousPlatform.xGridLocation == this.rightBorder - previousPlatform.length) {
            currentXLoc = this.leftBorder;
        }
        else {
            var leftDist = currentXLoc - (previousPlatform.xGridLocation + previousPlatform.length);
            if (leftDist > 5) {
                currentXLoc -= leftDist - 5;
            }
            else {
                var rightDist = previousPlatform.xGridLocation - (currentXLoc + currentLength);
                if (rightDist > 5) {
                    currentXLoc += rightDist - 5;
                }
            }
        }
        console.log("adjusted Location");
        return currentXLoc;
    };
    LevelGenerator.getGridIndex = function (x, y) {
        x = Phaser.Math.clamp(x - this.leftBorder, 0, this.gridLength - 1);
        return y * this.gridLength + x;
    };
    LevelGenerator.generatePowerUps = function (game, powerUpType, amount) {
        for (var i = 0; i < amount; i++) {
            this.spawnPowerUpAtRandomPosition(game, powerUpType);
        }
    };
    LevelGenerator.spawnPowerUpAtRandomPosition = function (game, powerUpType, tried) {
        if (tried === void 0) { tried = 0; }
        if (tried >= 300) {
            console.log("Tried 300 times but couldn't place the power-up");
            return;
        }
        var xPos = game.rnd.integerInRange(this.leftBorder * 8, this.rightBorder * 8);
        var yPos = game.rnd.integerInRange(9 * 8, this.highestYPosition);
        for (var i = 0; i < LevelManager.platforms.length; i++) {
            // Check if it will be spawned too close to a platform
            if (this.isTooCloseToPlatform(LevelManager.platforms[i], xPos, yPos)) {
                // Try a different location 
                //console.log("Too close to a platform: " + xPos + " " + yPos);
                this.spawnPowerUpAtRandomPosition(game, powerUpType, tried + 1);
                return;
            }
        }
        ;
        for (var i = 0; i < LevelManager.powerUps.length; i++) {
            // Check if it will be spawned too close to another power-up
            if (this.isTooCloseToPowerUp(LevelManager.powerUps[i], xPos, yPos)) {
                // Try a different location 
                //console.log("Too close to a power-up: " + xPos + " " + yPos);
                this.spawnPowerUpAtRandomPosition(game, powerUpType, tried + 1);
                return;
            }
        }
        ;
        LevelManager.addPowerUp(new PowerUp(game, powerUpType, xPos, yPos));
    };
    LevelGenerator.isTooCloseToPlatform = function (platform, xPos, yPos) {
        if (platform.isMoving) {
            return yPos - PowerUp.spriteSize < platform.yPosition - platform.tileSize && yPos + PowerUp.spriteSize > platform.yPosition;
        }
        return Phaser.Math.distance(platform.hitbox.centerX, platform.yPosition, xPos, yPos) < platform.hitbox.halfWidth + PowerUp.spriteSize;
    };
    LevelGenerator.isTooCloseToPowerUp = function (power, xPos, yPos) {
        return Phaser.Math.distance(power.xWorldPosition, power.yWorldPosition, xPos, yPos) < 120;
    };
    LevelGenerator.setLevelData = function (currentStage) {
        switch (currentStage) {
            case 1:
                this.platformLengthMin = 10;
                this.platformLengthMax = 12;
                this.platformYOffsetMin = 8;
                this.platformYOffsetMax = 9;
                this.platformsAmount = 23;
                break;
            case 2:
                this.platformLengthMin = 8;
                this.platformLengthMax = 11;
                this.platformYOffsetMin = 11;
                this.platformYOffsetMax = 13;
                this.platformsAmount = 16;
                break;
            case 3:
                this.platformLengthMin = 9;
                this.platformLengthMax = 11;
                this.platformYOffsetMin = 12;
                this.platformYOffsetMax = 14;
                this.platformsAmount = 15;
                this.redFishAmount = 5;
                break;
            case 4:
                this.platformLengthMin = 10;
                this.platformLengthMax = 12;
                this.platformYOffsetMin = 10;
                this.platformYOffsetMax = 12;
                this.platformsAmount = 17;
                this.icePlatformsAmountMin = 9;
                this.icePlatformsAmountMax = 12;
                this.redFishAmount = 1;
                break;
            case 5:
                this.platformLengthMin = 8;
                this.platformLengthMax = 10;
                this.platformYOffsetMin = 11;
                this.platformYOffsetMax = 13;
                this.platformsAmount = 16;
                this.icePlatformsAmountMin = 10;
                this.icePlatformsAmountMax = 12;
                this.redFishAmount = 1;
                break;
            case 6:
                this.platformLengthMin = 10;
                this.platformLengthMax = 12;
                this.platformYOffsetMin = 10;
                this.platformYOffsetMax = 13;
                this.platformsAmount = 17;
                this.movingPlatformsAmountMin = 10;
                this.movingPlatformsAmountMax = 12;
                this.movingPlatformSpeed = 1;
                this.redFishAmount = 1;
                break;
            case 7:
                this.platformLengthMin = 8;
                this.platformLengthMax = 10;
                this.platformYOffsetMin = 11;
                this.platformYOffsetMax = 14;
                this.platformsAmount = 16;
                this.movingPlatformsAmountMin = 10;
                this.movingPlatformsAmountMax = 12;
                this.movingPlatformSpeed = 1;
                this.redFishAmount = 1;
                break;
            case 8:
                this.platformLengthMin = 8;
                this.platformLengthMax = 11;
                this.platformYOffsetMin = 12;
                this.platformYOffsetMax = 15;
                this.platformsAmount = 15;
                this.movingPlatformsAmountMin = 8;
                this.movingPlatformsAmountMax = 10;
                this.movingPlatformSpeed = 1;
                this.icePlatformsAmountMin = 0;
                this.icePlatformsAmountMax = 1;
                this.jellyFishAmount = 3;
                break;
            case 9:
                this.platformLengthMin = 5;
                this.platformLengthMax = 8;
                this.platformYOffsetMin = 15;
                this.platformYOffsetMax = 17;
                this.platformsAmount = 13;
                this.movingPlatformsAmountMin = 8;
                this.movingPlatformsAmountMax = 9;
                this.movingPlatformSpeed = 1;
                this.jellyFishAmount = 5;
                break;
            case 10:
                this.platformLengthMin = 5;
                this.platformLengthMax = 8;
                this.platformYOffsetMin = 13;
                this.platformYOffsetMax = 15;
                this.platformsAmount = 16;
                this.starFishAmount = 3;
                break;
            case 11:
                this.platformLengthMin = 8;
                this.platformLengthMax = 11;
                this.platformYOffsetMin = 9;
                this.platformYOffsetMax = 12;
                this.platformsAmount = 17;
                this.conveyorPlatformsAmountMin = 11;
                this.conveyorPlatformsAmountMax = 13;
                this.conveyorSpeedValues = [0.5, -0.5];
                this.redFishAmount = 2;
                break;
            case 12:
                this.platformLengthMin = 10;
                this.platformLengthMax = 13;
                this.platformYOffsetMin = 9;
                this.platformYOffsetMax = 12;
                this.platformsAmount = 17;
                this.conveyorPlatformsAmountMin = 11;
                this.conveyorPlatformsAmountMax = 13;
                this.conveyorSpeedValues = [1, -1];
                this.redFishAmount = 2;
                break;
            case 13:
                this.platformLengthMin = 8;
                this.platformLengthMax = 13;
                this.platformYOffsetMin = 9;
                this.platformYOffsetMax = 12;
                this.platformsAmount = 17;
                this.conveyorPlatformsAmountMin = 3;
                this.conveyorPlatformsAmountMax = 3;
                this.conveyorSpeedValues = [0.5, -0.5];
                this.movingPlatformsAmountMin = 3;
                this.movingPlatformsAmountMax = 3;
                this.movingPlatformSpeed = 1;
                this.icePlatformsAmountMin = 6;
                this.icePlatformsAmountMax = 7;
                this.redFishAmount = 1;
                this.starFishAmount = 1;
                this.jellyFishAmount = 1;
                break;
            case 14:
                this.platformLengthMin = 8;
                this.platformLengthMax = 11;
                this.platformYOffsetMin = 9;
                this.platformYOffsetMax = 13;
                this.platformsAmount = 16;
                this.conveyorPlatformsAmountMin = 9;
                this.conveyorPlatformsAmountMax = 10;
                this.conveyorSpeedValues = [1, -1];
                this.icePlatformsAmountMin = 4;
                this.icePlatformsAmountMax = 5;
                this.redFishAmount = 1;
                this.starFishAmount = 1;
                this.jellyFishAmount = 1;
                break;
            case 15:
                this.platformLengthMin = 3;
                this.platformLengthMax = 5;
                this.platformYOffsetMin = 9;
                this.platformYOffsetMax = 13;
                this.platformsAmount = 16;
                this.icePlatformsAmountMin = 1;
                this.icePlatformsAmountMax = 1;
                this.movingPlatformsAmountMin = 3;
                this.movingPlatformsAmountMax = 3;
                this.movingPlatformSpeed = 1;
                this.starFishAmount = 8;
                break;
            case 16:
                this.platformLengthMin = 3;
                this.platformLengthMax = 5;
                this.platformYOffsetMin = 12;
                this.platformYOffsetMax = 15;
                this.platformsAmount = 13;
                this.starFishAmount = 1;
                this.redFishAmount = 8;
                break;
            case 17:
                this.platformLengthMin = 4;
                this.platformLengthMax = 5;
                this.platformYOffsetMin = 11;
                this.platformYOffsetMax = 13;
                this.platformsAmount = 16;
                this.icePlatformsAmountMin = 4;
                this.icePlatformsAmountMax = 4;
                this.movingPlatformsAmountMin = 9;
                this.movingPlatformsAmountMax = 10;
                this.movingPlatformSpeed = 1;
                this.redFishAmount = 1;
                this.starFishAmount = 1;
                this.jellyFishAmount = 1;
                break;
            case 18:
                this.platformLengthMin = 8;
                this.platformLengthMax = 11;
                this.platformYOffsetMin = 11;
                this.platformYOffsetMax = 13;
                this.platformsAmount = 14;
                this.conveyorPlatformsAmountMin = 9;
                this.conveyorPlatformsAmountMax = 9;
                this.conveyorSpeedValues = [2, -2];
                this.movingPlatformsAmountMin = 3;
                this.movingPlatformsAmountMax = 3;
                this.movingPlatformSpeed = 2;
                this.redFishAmount = 1;
                this.jellyFishAmount = 1;
                break;
            case 19:
                this.platformLengthMin = 5;
                this.platformLengthMax = 8;
                this.platformYOffsetMin = 11;
                this.platformYOffsetMax = 13;
                this.platformsAmount = 16;
                this.icePlatformsAmountMin = 12;
                this.icePlatformsAmountMax = 13;
                this.starFishAmount = 1;
                break;
            case 20:
                this.platformLengthMin = 3;
                this.platformLengthMax = 5;
                this.platformYOffsetMin = 11;
                this.platformYOffsetMax = 13;
                this.platformsAmount = 15;
                this.movingPlatformsAmountMin = 3;
                this.movingPlatformsAmountMax = 4;
                this.movingPlatformSpeed = 1.5;
                this.conveyorPlatformsAmountMin = 2;
                this.conveyorPlatformsAmountMax = 3;
                this.conveyorSpeedValues = [1.5, -1.5];
                this.jellyFishAmount = 4;
                break;
            case 21:
                this.platformLengthMin = 5;
                this.platformLengthMax = 8;
                this.platformYOffsetMin = 8;
                this.platformYOffsetMax = 9;
                this.platformsAmount = 25;
                this.icePlatformsAmountMin = 3;
                this.icePlatformsAmountMax = 5;
                this.movingPlatformsAmountMin = 6;
                this.movingPlatformsAmountMax = 7;
                this.movingPlatformSpeed = 2;
                this.conveyorPlatformsAmountMin = 8;
                this.conveyorPlatformsAmountMax = 9;
                this.conveyorSpeedValues = [2, -2];
                this.starFishAmount = 7;
                this.jellyFishAmount = 1;
                break;
            case 22:
                this.platformLengthMin = 5;
                this.platformLengthMax = 8;
                this.platformYOffsetMin = 11;
                this.platformYOffsetMax = 13;
                this.platformsAmount = 19;
                this.icePlatformsAmountMin = 2;
                this.icePlatformsAmountMax = 3;
                this.movingPlatformsAmountMin = 9;
                this.movingPlatformsAmountMax = 10;
                this.movingPlatformSpeed = 1.5;
                this.conveyorPlatformsAmountMin = 2;
                this.conveyorPlatformsAmountMax = 3;
                this.conveyorSpeedValues = [1.5, -1.5];
                this.starFishAmount = 5;
                this.jellyFishAmount = 1;
                break;
            case 23:
                this.platformLengthMin = 3;
                this.platformLengthMax = 5;
                this.platformYOffsetMin = 14;
                this.platformYOffsetMax = 17;
                this.platformsAmount = 13;
                this.icePlatformsAmountMin = 2;
                this.icePlatformsAmountMax = 3;
                this.movingPlatformsAmountMin = 2;
                this.movingPlatformsAmountMax = 3;
                this.movingPlatformSpeed = 1.5;
                this.conveyorPlatformsAmountMin = 2;
                this.conveyorPlatformsAmountMax = 3;
                this.conveyorSpeedValues = [1.5, -1.5];
                this.redFishAmount = 3;
                this.jellyFishAmount = 1;
                break;
            case 24:
                this.platformLengthMin = 9;
                this.platformLengthMax = 13;
                this.platformYOffsetMin = 14;
                this.platformYOffsetMax = 17;
                this.platformsAmount = 13;
                this.movingPlatformsAmountMin = 7;
                this.movingPlatformsAmountMax = 7;
                this.movingPlatformSpeed = 3;
                this.conveyorPlatformsAmountMin = 6;
                this.conveyorPlatformsAmountMax = 6;
                this.conveyorSpeedValues = [3, -3];
                this.redFishAmount = 1;
                this.starFishAmount = 1;
                break;
            case 25:
                this.platformLengthMin = 3;
                this.platformLengthMax = 5;
                this.platformYOffsetMin = 15;
                this.platformYOffsetMax = 16;
                this.platformsAmount = 13;
                this.icePlatformsAmountMin = 3;
                this.icePlatformsAmountMax = 3;
                this.movingPlatformsAmountMin = 5;
                this.movingPlatformsAmountMax = 5;
                this.movingPlatformSpeed = 2.9;
                this.conveyorPlatformsAmountMin = 5;
                this.conveyorPlatformsAmountMax = 5;
                this.conveyorSpeedValues = [2.3, -2.3];
                this.redFishAmount = 1;
                this.starFishAmount = 1;
                this.jellyFishAmount = 1;
                break;
            default:
                this.platformLengthMin = 3;
                this.platformLengthMax = 4;
                this.platformYOffsetMin = 9;
                this.platformYOffsetMax = 12;
                this.platformsAmount = 14;
                this.movingPlatformSpeed = 1;
                this.movingPlatformsAmountMin = 1;
                this.movingPlatformsAmountMax = 1;
                this.icePlatformsAmountMin = 3;
                this.icePlatformsAmountMax = 3;
                this.conveyorPlatformsAmountMin = 8;
                this.conveyorPlatformsAmountMax = 8;
                this.conveyorSpeedValues = [2.3, -2.3];
                this.redFishAmount = 4;
                this.jellyFishAmount = 4;
                this.starFishAmount = 2;
                LevelManager.purpleInk.isRising = false;
                HUD.stageText = "DEBUG";
                break;
        }
    };
    LevelGenerator.movingPlatformsAmountMin = 0;
    LevelGenerator.movingPlatformsAmountMax = 0;
    LevelGenerator.movingPlatformSpeed = 0;
    LevelGenerator.icePlatformsAmountMin = 0;
    LevelGenerator.icePlatformsAmountMax = 0;
    LevelGenerator.conveyorPlatformsAmountMin = 0;
    LevelGenerator.conveyorPlatformsAmountMax = 0;
    LevelGenerator.redFishAmount = 0;
    LevelGenerator.jellyFishAmount = 0;
    LevelGenerator.starFishAmount = 0;
    LevelGenerator.levelLength = 30;
    LevelGenerator.leftBorder = 2;
    LevelGenerator.rightBorder = 28;
    return LevelGenerator;
}());
var LevelManager = /** @class */ (function () {
    function LevelManager() {
    }
    Object.defineProperty(LevelManager, "levelWidth", {
        get: function () { return this.rightSide - this.leftSide; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LevelManager, "levelHeight", {
        get: function () { return 240; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LevelManager, "levelGoalMessage", {
        get: function () { return "GOAL!\nSTAGE BONUS " + this.stageBonusText + "\nTIME  BONUS " + this.timeBonusText; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LevelManager, "loseLifeMessage", {
        get: function () { return "MISS!"; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LevelManager, "gameOverMessage", {
        get: function () { return "GAME OVER!"; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LevelManager, "continueMessage", {
        get: function () { return this.gameOverMessage + "\nCONTINUE?\nYES: ENTER  \n  NO : BACKSPACE"; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LevelManager, "finalLevelMessage", {
        get: function () { return Cheats.hasUsedCheats ? "CHEATER!" : "CONGRATULATION!"; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LevelManager, "backgroundColor", {
        get: function () {
            if (HUD.currentStage <= 10) {
                return 0x30306a;
            }
            else if (HUD.currentStage <= 20) {
                return 0x033f52;
            }
            return 0x5047fa;
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(LevelManager, "stageBonus", {
        get: function () {
            if (HUD.currentStage < 10) {
                return 300;
            }
            else if (HUD.currentStage < 20) {
                return 600;
            }
            return 1000;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LevelManager, "timeBonus", {
        get: function () {
            return Math.max(0, 1200 - Math.floor(GameTimer.currrentTime / 100) * 3);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LevelManager, "stageBonusText", {
        get: function () {
            return ("    " + this.stageBonus).slice(-4);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LevelManager, "timeBonusText", {
        get: function () {
            return ("    " + this.timeBonus).slice(-4);
        },
        enumerable: true,
        configurable: true
    });
    LevelManager.initialize = function (game) {
        this.game = game;
        // Creating the groups
        this.backgroundGroup = game.add.group(game.world);
        this.objectGroup = game.add.group(game.world);
        this.foregroundGroup = game.add.group(game.world);
        this.backgroundGroup.position.x = this.levelPosition;
        this.objectGroup.position.x = this.levelPosition;
        this.foregroundGroup.position.x = this.levelPosition;
        // Creating the background
        this.background = game.add.tileSprite(0, 0, 240, this.game.world.bounds.height, 'sheet');
        this.background.setFrame(new Phaser.Frame(0, 2, 126, 240, 240, "frame0"));
        this.backgroundPosition = new Phaser.Point(0, 0);
        this.backgroundGroup.add(this.background);
        // Creating the purple ink
        this.purpleInk = new PurpleInk(game);
        this.foregroundGroup.add(this.purpleInk.topPurpleInkSprite);
        this.foregroundGroup.add(this.purpleInk.bottomPurpleInkSprite);
        // Creating the squid
        this.squid = new Squid(game);
        this.objectGroup.add(this.squid.sprite);
        this.objectGroup.add(this.squid.sparklesEffectSprite);
        this.camera = new Camera(this.squid);
        // Sorting the checkpoints
        this.checkpoints.sort(function (n1, n2) { return n2 - n1; });
        this.createLevel(HUD.currentStage);
    };
    LevelManager.createLevel = function (stage) {
        // Generate the level
        LevelGenerator.generateLevel(this.game, stage);
        this.updatePlatforms();
        this.reset();
    };
    LevelManager.reset = function () {
        // Placing the squid on the ground
        this.squid.reset();
        this.squid.sprite.position.set(this.levelWidth / 2, this.platforms[0].yPosition);
        this.purpleInk.Reset();
        this.camera.reset();
        GameTimer.reset();
        this.powerUps.forEach(function (power) {
            power.isActive = true;
        });
        this.game.stage.backgroundColor = this.backgroundColor;
    };
    LevelManager.addPlatform = function (platform) {
        this.backgroundGroup.add(platform.sprite);
        this.platforms.push(platform);
        this.camera.placeTileSpriteInScreen(platform.sprite, platform.yPosition);
    };
    LevelManager.addPowerUp = function (powerUp) {
        this.objectGroup.add(powerUp.sprite);
        this.powerUps.push(powerUp);
        this.camera.placeSpriteInScreen(powerUp.sprite, powerUp.yWorldPosition);
    };
    LevelManager.update = function () {
        if (!UIManager.dialogIsOpen) {
            this.updateSquid();
            if (!this.squid.isDead) {
                // Update Camera
                this.camera.update();
                // Update Level Elements
                this.updatePlatforms();
                this.updateBackground();
                this.updatePowerUps();
                this.updatePurpleInk();
                // Update UI
                GameTimer.update(this.game);
                HUD.updateTimer();
            }
        }
        // The squid should continue to update if the dead dialog is open so that the dead animation will play correctly
        else if (this.squid.isDead) {
            this.squid.update();
        }
    };
    LevelManager.updateSquid = function () {
        this.squid.update();
        // Squid will be warped to the other side of the screen when it moved outside the screen
        if (this.squid.sprite.position.x > this.rightSide) {
            this.squid.sprite.position.x = this.leftSide;
        }
        else if (this.squid.sprite.position.x < this.leftSide) {
            this.squid.sprite.position.x = this.rightSide;
        }
    };
    LevelManager.updateBackground = function () {
        // Move the background slowly
        this.backgroundPosition.add(this.backgroundMovingSpeed.x * GameTimer.levelDeltaTime, this.backgroundMovingSpeed.y * GameTimer.levelDeltaTime);
        // Update the background position
        this.background.tilePosition.x = this.backgroundPosition.x;
        this.background.tilePosition.y = this.backgroundPosition.y + this.camera.yPosition;
    };
    LevelManager.updatePlatforms = function () {
        var _this = this;
        this.platforms.forEach(function (platform) {
            platform.update();
            _this.camera.placeTileSpriteInScreen(platform.sprite, platform.yPosition);
            _this.squid.updatePlatformCollision(platform);
        });
    };
    LevelManager.updatePowerUps = function () {
        for (var i = 0; i < this.powerUps.length; i++) {
            var powerUp = this.powerUps[i];
            if (!powerUp.isActive) {
                continue;
            }
            this.camera.placeSpriteInScreen(powerUp.sprite, powerUp.yWorldPosition);
            if (this.squid.collidesWith(powerUp.hitbox)) {
                switch (powerUp.powerUpType) {
                    case PowerUpTypes.Zapfish:
                        UIManager.openDialog(this.levelGoalMessage, this.finishLevel);
                        break;
                    case PowerUpTypes.RedFish:
                        this.squid.applyJumpForce(PowerUp.redFishJumpForce);
                        break;
                    case PowerUpTypes.JellyFish:
                        this.squid.applyDoubleJumpPower(PowerUp.powerUpDuration);
                        break;
                    case PowerUpTypes.StarFish:
                        this.squid.applySpeedUpPower(PowerUp.powerUpDuration);
                        break;
                }
                // Make the pickup inactive after its used
                if (powerUp.powerUpType != PowerUpTypes.Zapfish) {
                    powerUp.isActive = false;
                }
            }
        }
    };
    // Finishing level logic is in a different function. Using 'this' reference doesn't work, so another function is called instead.
    LevelManager.finishLevel = function () {
        if (HUD.currentStage != HUD.finalStage) {
            LevelManager.nextLevel();
        }
        else {
            UIManager.openDialog(LevelManager.finalLevelMessage, LevelManager.finishGame);
        }
    };
    LevelManager.nextLevel = function () {
        // Update the UI values 
        HUD.addScore(this.stageBonus + this.timeBonus);
        HUD.currentStage++;
        // Just in case it goes past the final stage
        if (HUD.currentStage > HUD.finalStage) {
            this.gameOver();
            return;
        }
        // Check if the player recieves an extra life
        if (this.lifeBonusLevels.indexOf(HUD.currentStage) > -1) {
            HUD.addLifes(1);
        }
        // Destroy the level
        this.destroyLevel();
        this.purpleInk.isRising = this.purpleInk.isRisingByDefault;
        // Refresh the UI and create a new level
        HUD.refreshUI();
        this.createLevel(HUD.currentStage);
    };
    LevelManager.finishGame = function () {
        LevelManager.gameOver();
    };
    LevelManager.destroyLevel = function () {
        for (var i = 0; i < this.powerUps.length; i++) {
            this.powerUps[i].destroy();
        }
        for (var i = 0; i < this.platforms.length; i++) {
            this.platforms[i].destroy();
        }
        this.powerUps = [];
        this.platforms = [];
    };
    LevelManager.updatePurpleInk = function () {
        this.purpleInk.Update();
        // Update the sprite
        this.camera.placeTileSpriteInScreen(this.purpleInk.topPurpleInkSprite, Math.round(this.purpleInk.risingHeight));
        this.purpleInk.bottomPurpleInkSprite.position.y = this.purpleInk.topPurpleInkSprite.bottom;
        this.purpleInk.bottomPurpleInkSprite.height = Math.max(0, this.camera.height - this.purpleInk.topPurpleInkSprite.bottom);
        if (this.purpleInk.deadHeight < this.squid.sprite.bottom) {
            this.squid.die();
            UIManager.openDialog(this.loseLifeMessage, this.retryLevelEvent);
        }
    };
    LevelManager.getLastCheckpoint = function () {
        // Find the last checkpoint
        for (var i = 0; i < this.checkpoints.length; i++) {
            if (HUD.currentStage >= this.checkpoints[i]) {
                return this.checkpoints[i];
            }
        }
        // Reset the hud and start from the correct checkpoint
        return 1;
    };
    LevelManager.retryLevelEvent = function () {
        LevelManager.retryLevel();
    };
    LevelManager.retryLevel = function () {
        // Remove 1 life if we still have lifes left
        if (HUD.lifes > 0) {
            HUD.addLifes(-1);
            LevelManager.reset();
        }
        // No more lifes means game over
        else {
            // Give the player the option to continue from a checkpoint stage if the current stage is passed one
            var checkpointStage = LevelManager.getLastCheckpoint();
            if (checkpointStage > 1) {
                UIManager.openOptionDialog(this.continueMessage, Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, this.gameOver);
            }
            // Skip the continue option dialog if the player hasn't passed any checkpoint stages
            else {
                UIManager.openDialog(this.gameOverMessage, this.gameOver);
            }
        }
    };
    LevelManager.gameOver = function (continueStage) {
        if (continueStage === void 0) { continueStage = false; }
        // Reset everything in the HUD and start from the correct stage
        if (continueStage) {
            HUD.reset(LevelManager.getLastCheckpoint());
        }
        else {
            HUD.reset();
        }
        // Destroy the current level and create a new one
        LevelManager.destroyLevel();
        LevelManager.createLevel(HUD.currentStage);
    };
    LevelManager.platforms = [];
    LevelManager.powerUps = [];
    LevelManager.leftSide = 0;
    LevelManager.rightSide = 240;
    LevelManager.levelPosition = 80;
    LevelManager.backgroundMovingSpeed = new Phaser.Point(0.96, 4.32);
    LevelManager.checkpoints = [6, 11, 16, 21];
    // All the levels that gives you a bonus life
    LevelManager.lifeBonusLevels = [16];
    return LevelManager;
}());
var PurpleInk = /** @class */ (function () {
    function PurpleInk(game) {
        this.isRisingByDefault = true;
        this.isRising = true;
        this.startingHeight = -733;
        this.nonMovingHeight = -32;
        this.risingSpeed = 55; // Pixels per second
        this.tileSize = 8;
        this.game = game;
        this.topPurpleInkSprite = game.add.tileSprite(0, this.startingHeight, 240, this.tileSize, 'sheet');
        this.topPurpleInkSprite.setFrame(new Phaser.Frame(0, 58, 50, this.tileSize, this.tileSize, "frame0"));
        this.bottomPurpleInkSprite = game.add.tileSprite(0, this.startingHeight, 240, 240, 'sheet');
        this.bottomPurpleInkSprite.setFrame(new Phaser.Frame(0, 68, 50, this.tileSize, this.tileSize, "frame0"));
        this.Reset();
    }
    Object.defineProperty(PurpleInk.prototype, "risingHeight", {
        get: function () { return this.height; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PurpleInk.prototype, "deadHeight", {
        // The squid dies if he is below this height
        get: function () { return this.topPurpleInkSprite.top; },
        enumerable: true,
        configurable: true
    });
    PurpleInk.prototype.Reset = function () {
        this.height = this.isRising ? this.startingHeight : this.nonMovingHeight;
    };
    PurpleInk.prototype.Update = function () {
        if (this.isRising) {
            this.height += this.risingSpeed * GameTimer.levelDeltaTime;
        }
    };
    return PurpleInk;
}());
var DialogMessage = /** @class */ (function () {
    function DialogMessage(game, text, x, y, width, height) {
        this.width = width;
        this.height = height;
        this.blackRect = game.add.graphics();
        this.blackRect.lineStyle(0);
        this.blackRect.beginFill(0x000000, 1);
        this.blackRect.drawRect(x - this.width / 2, y - this.height / 2, this.width, this.height);
        this.blackRect.endFill();
        this.font = UIManager.getFont();
        this.font.align = Phaser.RetroFont.ALIGN_CENTER;
        this.font.multiLine = true;
        this.font.text = text;
        this.image = game.add.image(x, y, this.font);
        this.image.anchor.set(0.5, 0.5);
    }
    DialogMessage.prototype.destroy = function () {
        this.blackRect.destroy();
        this.image.destroy();
        this.font.destroy(true);
    };
    return DialogMessage;
}());
var FontImage = /** @class */ (function () {
    function FontImage(game, text, positionX, positionY) {
        this.font = game.add.retroFont("sheet", 8, 10, Phaser.RetroFont.TEXT_SET2, 16, 2, 0, 3, 82);
        this.font.multiLine = true;
        this.font.align = Phaser.RetroFont.ALIGN_CENTER;
        this.font.text = text;
        this.image = game.add.image(positionX, positionY, this.font);
        this.image.anchor.set(0.5, 1);
    }
    FontImage.prototype.changeText = function (text) {
        this.font.text = text;
    };
    return FontImage;
}());
var GameStorage = /** @class */ (function () {
    function GameStorage() {
    }
    GameStorage.storeHighscore = function (newHighScore) {
        try {
            localStorage.setItem(this.highscoreKey, newHighScore.toString());
        }
        catch (e) { }
    };
    GameStorage.retrieveHighscore = function () {
        try {
            if (localStorage.getItem(this.highscoreKey) !== null) {
                return parseInt(localStorage.getItem(this.highscoreKey));
            }
        }
        catch (e) { }
        return 0;
    };
    GameStorage.highscoreKey = "highscore";
    return GameStorage;
}());
var GameTimer = /** @class */ (function () {
    function GameTimer() {
    }
    Object.defineProperty(GameTimer, "maxTime", {
        get: function () { return (9 * 60 + 59) * 1000 + 999; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameTimer, "levelDeltaTime", {
        get: function () { return this.game.time.physicsElapsed * this.levelSpeed; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(GameTimer, "playerDeltaTime", {
        get: function () { return this.levelDeltaTime * this.playerSpeed; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(GameTimer, "objectsDeltaTime", {
        get: function () { return this.levelDeltaTime * this.objectsSpeed; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(GameTimer, "playerDeltaTimeMiliseconds", {
        get: function () { return this.playerDeltaTime * 1000; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(GameTimer, "levelDeltaTimeMiliseconds", {
        get: function () { return this.levelDeltaTime * 1000; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(GameTimer, "objectsDeltaTimeMiliseconds", {
        get: function () { return this.objectsDeltaTime * 1000; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(GameTimer, "minutes", {
        get: function () { return Math.floor(this.roundedTime / 60000); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameTimer, "seconds", {
        get: function () { return Math.floor(this.roundedTime / 1000) - this.minutes * 60; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameTimer, "miliseconds", {
        get: function () { return this.roundedTime - this.seconds * 1000; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameTimer, "currrentTime", {
        get: function () { return this.timer; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameTimer, "roundedTime", {
        get: function () { return Math.round(this.timer); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameTimer, "minutesText", {
        get: function () {
            return Math.min(this.minutes, 9).toString();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameTimer, "secondsText", {
        get: function () {
            return ("0" + this.seconds).slice(-2);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameTimer, "milisecondsText", {
        get: function () {
            return ("00" + this.miliseconds).slice(-3).slice(0, 2);
        },
        enumerable: true,
        configurable: true
    });
    GameTimer.initialize = function (game) {
        this.game = game;
    };
    GameTimer.reset = function () {
        this.timer = 0;
    };
    GameTimer.update = function (game) {
        this.timer += this.levelDeltaTimeMiliseconds;
    };
    GameTimer.getStageTimerAsText = function () {
        return this.minutesText + ":" + this.secondsText + ":" + this.milisecondsText;
    };
    GameTimer.levelSpeed = 1;
    GameTimer.playerSpeed = 1;
    GameTimer.objectsSpeed = 1;
    GameTimer.timer = 0;
    return GameTimer;
}());
var HUD = /** @class */ (function () {
    function HUD() {
    }
    Object.defineProperty(HUD, "lifeSpriteSize", {
        get: function () { return new Phaser.Point(9, 8); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HUD, "lifesUIPosition", {
        get: function () { return new Phaser.Point(385 - (this.lifes - 1) * this.lifeSpriteSize.x, 100); },
        enumerable: true,
        configurable: true
    });
    HUD.create = function (game) {
        this.font = UIManager.getFont();
        this.font.multiLine = true;
        this.font.align = Phaser.RetroFont.ALIGN_CENTER;
        this.image = game.add.image(330, 24, this.font);
        this.lifeSprite = game.add.tileSprite(this.lifesUIPosition.x, this.lifesUIPosition.y, this.lifeSpriteSize.x, this.lifeSpriteSize.y, 'sheet');
        this.lifeSprite.anchor.set(1, 0);
        this.lifeSprite.setFrame(new Phaser.Frame(0, 127, 10, this.lifeSpriteSize.x, this.lifeSpriteSize.y, "frame0"));
        // Get the highscore that is stored locally
        this.highScore = GameStorage.retrieveHighscore();
        this.refreshUI();
    };
    HUD.addScore = function (points) {
        if (this.scoreIsDisabled) {
            return;
        }
        this.currentScore += points;
        if (this.currentScore > this.highScore) {
            this.updateHighScore(this.currentScore);
        }
    };
    HUD.updateHighScore = function (newHighScore) {
        this.highScore = newHighScore;
        GameStorage.storeHighscore(newHighScore);
    };
    HUD.disableScore = function () {
        this.currentScore = 0;
        this.scoreIsDisabled = true;
    };
    HUD.enableScore = function () {
        this.scoreIsDisabled = false;
    };
    HUD.addLifes = function (amount) {
        this.lifes += amount;
        this.refreshLifesSprite();
    };
    HUD.refreshUI = function () {
        this.hudText = "HI SCORE\n" + this.highScore + "\n\nSCORE\n" + this.currentScore + "\n\n" + this.stageText + " " + this.currentStage + "\n\n\n\n\n";
        this.refreshLifesSprite();
        this.updateTimer();
    };
    HUD.refreshLifesSprite = function () {
        this.lifeSprite.width = this.lifeSpriteSize.x * this.lifes;
    };
    HUD.updateTimer = function () {
        this.font.text = this.hudText + GameTimer.getStageTimerAsText();
    };
    HUD.reset = function (stage) {
        if (stage === void 0) { stage = 1; }
        this.lifes = this.startLifes;
        this.currentStage = stage;
        this.currentScore = 0;
        this.refreshUI();
    };
    HUD.maxLifes = 4;
    HUD.startLifes = 2;
    HUD.finalStage = 25;
    HUD.currentStage = 1;
    HUD.currentScore = 0;
    HUD.highScore = 0;
    HUD.scoreIsDisabled = false;
    HUD.lifes = HUD.startLifes;
    HUD.stageText = "STAGE";
    return HUD;
}());
var UIManager = /** @class */ (function () {
    function UIManager() {
    }
    Object.defineProperty(UIManager, "dialogIsOpen", {
        get: function () { return this.dialog != undefined; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UIManager, "rightBlackBarXPos", {
        get: function () { return this.leftBlackBarWidth + LevelManager.levelWidth; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UIManager, "levelCenter", {
        get: function () { return new Phaser.Point(this.leftBlackBarWidth + LevelManager.levelWidth / 2, LevelManager.levelHeight / 2); },
        enumerable: true,
        configurable: true
    });
    UIManager.create = function (game) {
        this.game = game;
        this.createBlackBars();
        this.optionDialogData = { callbackEvent: undefined, confirmA: undefined, confirmB: undefined };
        HUD.create(game);
        InputManager.confirmKey.onDown.add(this.confirmOptionA, this);
        InputManager.goBackKey.onDown.add(this.confirmOptionB, this);
    };
    UIManager.confirmOptionA = function () {
        if (!this.dialogIsOpen) {
            return;
        }
        if (UIManager.optionDialogData.callbackEvent != undefined) {
            UIManager.optionDialogData.callbackEvent(true);
            UIManager.optionDialogData.callbackEvent = undefined;
            UIManager.closeDialog();
        }
    };
    UIManager.confirmOptionB = function () {
        if (!this.dialogIsOpen) {
            return;
        }
        if (UIManager.optionDialogData.callbackEvent != undefined) {
            UIManager.optionDialogData.callbackEvent(false);
            UIManager.optionDialogData.callbackEvent = undefined;
            UIManager.closeDialog();
        }
    };
    UIManager.update = function () {
        // Close the dialog if the correct key is pressed
        if (this.dialogIsOpen && UIManager.keyCodeToCloseDialog != undefined && UIManager.keyCodeToCloseDialog.justDown) {
            UIManager.closeDialog();
        }
    };
    UIManager.createBlackBars = function () {
        var graphics = this.game.add.graphics();
        // Draw left side blackbar
        graphics.lineStyle(0);
        graphics.beginFill(0x000000, 1);
        graphics.drawRect(0, 0, this.leftBlackBarWidth, LevelManager.levelWidth);
        graphics.endFill();
        // Draw right side blackbar
        graphics.beginFill(0x000000, 1);
        graphics.drawRect(this.rightBlackBarXPos, 0, this.rightBlackBarWidth, LevelManager.levelWidth);
        graphics.endFill();
    };
    UIManager.getFont = function () {
        return this.game.add.retroFont("gamefont", 8, 10, Phaser.RetroFont.TEXT_SET2, 16, 2, 0, 3, 82);
    };
    UIManager.openDialog = function (text, callback, keyToClose, width, height) {
        if (width === void 0) { width = 154; }
        if (height === void 0) { height = 64; }
        this.dialog = new DialogMessage(this.game, text, this.levelCenter.x, this.levelCenter.y, width, height);
        this.dialogCallback = callback;
        if (keyToClose != undefined) {
            this.keyCodeToCloseDialog = keyToClose;
            return;
        }
        // Close the dialog after a certain amount of time
        this.dialogTimerEvent = this.game.time.events.add(this.dialogDuration, this.closeDialog, this);
    };
    UIManager.openOptionDialog = function (text, confirmAKey, confirmBKey, callback, width, height) {
        if (width === void 0) { width = 154; }
        if (height === void 0) { height = 64; }
        this.optionDialogData.confirmA = confirmAKey;
        this.optionDialogData.confirmB = confirmBKey;
        this.optionDialogData.callbackEvent = callback;
        this.dialog = new DialogMessage(this.game, text, this.levelCenter.x, this.levelCenter.y, width, height);
    };
    UIManager.closeDialog = function () {
        this.dialog.destroy();
        this.dialog = undefined;
        this.keyCodeToCloseDialog = undefined;
        // Check if it should call an event after closing the dialog
        if (this.dialogCallback != undefined) {
            var dialogCallbackTemp = this.dialogCallback;
            this.dialogCallback();
            // If there is not a new dialog open make this undifined so that the function doesn't get called again
            if (dialogCallbackTemp == this.dialogCallback) {
                this.dialogCallback = undefined;
            }
        }
    };
    UIManager.showTransparentOverlay = function (color, alhpa) {
        this.transparentRect = this.game.add.graphics();
        this.transparentRect.lineStyle(0);
        this.transparentRect.beginFill(color, alhpa);
        this.transparentRect.drawRect(LevelManager.levelPosition, 0, LevelManager.levelWidth, LevelManager.levelHeight);
        this.transparentRect.endFill();
    };
    UIManager.hideTransparentOverlay = function () {
        this.transparentRect.destroy();
    };
    UIManager.dialogDuration = 2500; // Milliseconds
    UIManager.keyCodeToCloseDialog = undefined;
    UIManager.leftBlackBarWidth = 80;
    UIManager.rightBlackBarWidth = 112;
    return UIManager;
}());
//# sourceMappingURL=squidjump.js.map