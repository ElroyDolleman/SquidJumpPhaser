class LevelGenerator
{
    private static platformLengthMin: number;
    private static platformLengthMax: number;
    private static platformYOffsetMin: number;
    private static platformYOffsetMax: number;
    private static platformsAmount: number;

    private static movingPlatformsAmountMin: number = 0;
    private static movingPlatformsAmountMax: number = 0;
    private static movingPlatformSpeed: number = 0;
    private static icePlatformsAmountMin: number = 0;
    private static icePlatformsAmountMax: number = 0;
    private static conveyorPlatformsAmountMin: number = 0;
    private static conveyorPlatformsAmountMax: number = 0;
    private static conveyorSpeedValues: number[];

    private static redFishAmount: number = 0;
    private static jellyFishAmount: number = 0;
    private static starFishAmount: number = 0;

    private static readonly levelLength = 30;
    private static readonly leftBorder = 2;
    private static readonly rightBorder = 28;

    private static get gridLength(): number { return this.rightBorder - this.leftBorder; }
    private static excludedGridIndices: number[];
    private static highestYPosition: number;

    static generateLevel(game: Phaser.Game, currentStage: number)
    {
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
    }

    private static generatePlatforms(game: Phaser.Game)
    {
        // Create the ground
        var lastPlatform = new Platform(game, 0, 0, this.levelLength);
        LevelManager.addPlatform(lastPlatform);

        let platformIndices: number[] = Array.apply(null, {length: this.platformsAmount}).map(Function.call, Number);;
        let icePlatforms: number[] = new Array();
        let movingPlatforms: number[] = new Array();
        let conveyorPlatforms: number[] = new Array();

        // Determines which platforms are going to be ice, and how many ice platforms there will be
        let icePlatformsAmount = this.icePlatformsAmountMax > 0 ? game.rnd.integerInRange(this.icePlatformsAmountMin, this.icePlatformsAmountMax) : 0;
        for (let i = 0; i < icePlatformsAmount; i++) {
            let index = game.rnd.integerInRange(0, platformIndices.length-1);
            icePlatforms.push(platformIndices[index]);
            platformIndices.splice(index, 1);
        }

        // Determines which platforms are moving, and how many moving platforms there will be
        let movingPlatformsAmount = this.movingPlatformsAmountMax > 0 ? game.rnd.integerInRange(this.movingPlatformsAmountMin, this.movingPlatformsAmountMax) : 0;
        for (let i = 0; i < movingPlatformsAmount; i++) {
            let index = game.rnd.integerInRange(0, platformIndices.length-1);
            movingPlatforms.push(platformIndices[index]);
            platformIndices.splice(index, 1);
        }

        // Determines which platforms are moving, and how many moving platforms there will be
        let conveyorPlatformsAmount = this.conveyorPlatformsAmountMax > 0 ? game.rnd.integerInRange(this.conveyorPlatformsAmountMin, this.conveyorPlatformsAmountMax) : 0;
        for (let i = 0; i < conveyorPlatformsAmount; i++) {
            let index = game.rnd.integerInRange(0, platformIndices.length-1);
            conveyorPlatforms.push(platformIndices[index]);
            platformIndices.splice(index, 1);
        }

        for (let i = 0; i < this.platformsAmount; i++) {
            // Platform gets a random length
            let length = game.rnd.integerInRange(this.platformLengthMin, this.platformLengthMax);

            // Platform is placed at a random x location
            let xLoc = game.rnd.integerInRange(this.leftBorder, this.rightBorder - length);
            
            // Platform is placed at a random heigh from the previous one
            let yLoc = 1 + lastPlatform.yGridLocation + game.rnd.integerInRange(this.platformYOffsetMin, this.platformYOffsetMax);

            // Check which type of platform there will be generated
            let platformType = PlatformType.Normal;
            if (icePlatforms.indexOf(i) > -1) {
                platformType = PlatformType.Ice;

                // If the ice platform is small, make sure to move it close to the previous platform, or the level will be unbeatable
                if (length < 6 && i > 0) {
                    xLoc = this.getCloseXLocationToPlatform(lastPlatform, xLoc, length);
                }
            }
            else if (movingPlatforms.indexOf(i) > -1) {
                platformType = PlatformType.Moving;
            }
            else if (conveyorPlatforms.indexOf(i) > -1) {
                platformType = PlatformType.Conveyor;

                // Makes sure to put fast small conveyors close to each other
                if (length < 5 && i > 0 && lastPlatform.platformType == PlatformType.Conveyor) {
                    // Check if there are fast conveyors
                    let conveyorsAreFast = false;
                    for (let i = 0; i < this.conveyorSpeedValues.length; i++) {
                        if (Math.abs(this.conveyorSpeedValues[i]) > 2) {
                            conveyorsAreFast = true;
                            break;
                        }
                    }
                    if (conveyorsAreFast) {
                        xLoc = this.getCloseXLocationToPlatform(lastPlatform, xLoc, length);
                    }
                }
            }

            // Add a new platform to the level
            LevelManager.addPlatform(lastPlatform = new Platform(game, xLoc, yLoc, length, platformType));         
            
            // Set extra values for special platforms
            if (platformType == PlatformType.Moving) {
                lastPlatform.setMovingSpeed(this.movingPlatformSpeed);
            }
            else if (platformType == PlatformType.Conveyor) {
                // Choose a random force for the conveyor platforms
                lastPlatform.setForce(this.conveyorSpeedValues[game.rnd.integerInRange(0, this.conveyorSpeedValues.length-1)]);
            }

            // Store the location of the highest platform
            if (i == this.platformsAmount-1) {
                this.highestYPosition = lastPlatform.yPosition;
            }
        }

        // Add all the power-ups to the level
        this.generatePowerUps(game, PowerUpTypes.JellyFish, this.jellyFishAmount);
        this.generatePowerUps(game, PowerUpTypes.RedFish, this.redFishAmount);
        this.generatePowerUps(game, PowerUpTypes.StarFish, this.starFishAmount);

        LevelManager.addPowerUp(new PowerUp(
            game, 
            PowerUpTypes.Zapfish, 
            this.levelLength * 8 / 2, 
            lastPlatform.yPosition + (game.rnd.integerInRange(this.platformYOffsetMin, this.platformYOffsetMax) * 8)
        ));
    }

    private static getCloseXLocationToPlatform(previousPlatform: Platform, currentXLoc: number, currentLength: number): number
    {
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
    }

    private static getGridIndex(x: number, y: number): number
    {
        x = Phaser.Math.clamp(x - this.leftBorder, 0, this.gridLength-1);
        return y * this.gridLength + x;
    }

    private static generatePowerUps(game: Phaser.Game, powerUpType: PowerUpTypes, amount: number)
    {
        for (let i = 0; i < amount; i++) {
            this.spawnPowerUpAtRandomPosition(game, powerUpType);
        }
    }

    private static spawnPowerUpAtRandomPosition(game: Phaser.Game, powerUpType: PowerUpTypes, tried: number = 0)
    {
        if (tried >= 300) {
            console.log("Tried 300 times but couldn't place the power-up");
            return;
        }

        let xPos = game.rnd.integerInRange(this.leftBorder * 8, this.rightBorder * 8);
        let yPos = game.rnd.integerInRange(9 * 8, this.highestYPosition);

        for (let i = 0; i < LevelManager.platforms.length; i++) {
            // Check if it will be spawned too close to a platform
            if (this.isTooCloseToPlatform(LevelManager.platforms[i], xPos, yPos)) {
                // Try a different location 
                //console.log("Too close to a platform: " + xPos + " " + yPos);
                this.spawnPowerUpAtRandomPosition(game, powerUpType, tried+1);
                return;
            }
        };

        for (let i = 0; i < LevelManager.powerUps.length; i++) {
            // Check if it will be spawned too close to another power-up
            if (this.isTooCloseToPowerUp(LevelManager.powerUps[i], xPos, yPos)) {
                // Try a different location 
                //console.log("Too close to a power-up: " + xPos + " " + yPos);
                this.spawnPowerUpAtRandomPosition(game, powerUpType, tried+1);
                return;
            }
        };

        LevelManager.addPowerUp(new PowerUp(game, powerUpType, xPos, yPos));
    }

    private static isTooCloseToPlatform(platform: Platform, xPos: number, yPos: number)
    {
        if (platform.isMoving) {
            return yPos - PowerUp.spriteSize < platform.yPosition - platform.tileSize && yPos + PowerUp.spriteSize > platform.yPosition;
        }

        return Phaser.Math.distance(platform.hitbox.centerX, platform.yPosition, xPos, yPos) < platform.hitbox.halfWidth + PowerUp.spriteSize;
    }

    private static isTooCloseToPowerUp(power: PowerUp, xPos: number, yPos: number)
    {
        return Phaser.Math.distance(power.xWorldPosition, power.yWorldPosition, xPos, yPos) < 120;
    }

    private static setLevelData(currentStage: number)
    {
        switch(currentStage) {
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

                LevelManager.water.isRising = false;
                HUD.stageText = "DEBUG"
            break;
        }
    }
}