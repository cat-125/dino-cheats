const cheats = {
	playerEsp: false,
	esp: false,
	espOutline: false,
	espInfo: false,
	textOutline: false,
	tracers: false,
	tracersOutline: false,
	hitboxes: false,
	outerHitboxes: false,
	blackHitboxes: false,
	trajectory: false,
	jumpHelper: false,
	noSpeedIncrease: false,
	obstacleBypass: false,
	bhop: false,
	jumpFix: true,
	noObstacles: false
};

let isJumpDown = false;

function initCheats() {
	const width = Math.min(window.innerWidth - 30, 500);
	const height = Math.min(width / 6 * 4, 300);
	const win = new cheatgui.Window({
		x: window.innerWidth - (width + 15),
		y: window.innerHeight - (height + 45),
		height: height,
		width: width,
		title: 'Cheats'
	});

	let gameOver = null;

	const globalMods = new cheatgui.Tree('Game');
	win.append(globalMods);

	const playerMods = new cheatgui.Tree('Player');
	win.append(playerMods);

	const visualMods = new cheatgui.Tree('Visuals');
	win.append(visualMods);

	const obstacleMods = new cheatgui.Tree('Obstacles');
	win.append(obstacleMods);

	const miscMods = new cheatgui.Tree('Miscs');
	win.append(miscMods);

	/******************************
	 ***** Game ********************
	 ******************************/

	const scoreInput = new cheatgui.NumberInput('Score');
	const scoreBtn = new cheatgui.Button('Set score');
	scoreBtn.onClick(() => {
		const val = scoreInput.getValue();

		if (!isNaN(+val)) Runner.instance_.distanceRan = +val / Runner.instance_.distanceMeter.config.COEFFICIENT;
	});
	globalMods.append(scoreInput);
	globalMods.append(scoreBtn);

	globalMods.append(new cheatgui.Switch('No speed increase').bind(cheats, 'noSpeedIncrease'));

	const gameOverBtn = new cheatgui.Button('End game');
	gameOverBtn.onClick(() => {
		if (!gameOver) gameOver = Runner.instance_.gameOver.bind(Runner.instance_);
		gameOver();
	});
	globalMods.append(gameOverBtn);


	/******************************
	 ***** Player ******************
	 ******************************/

	const speedInput = new cheatgui.NumberInput('Speed', 8);
	const speedBtn = new cheatgui.Button('Set speed');
	speedBtn.onClick(() => Runner.instance_.currentSpeed = speedInput.getValue());
	playerMods.append(speedInput);
	playerMods.append(speedBtn);

	const jumpHeightInput = new cheatgui.NumberInput('Jump height', 10);
	const jumpHeightBtn = new cheatgui.Button('Set jump height');
	jumpHeightBtn.onClick(() => Runner.instance_.tRex.setJumpVelocity(jumpHeightInput.getValue()));
	playerMods.append(jumpHeightInput);
	playerMods.append(jumpHeightBtn);

	const noClipSwitch = new cheatgui.Switch('No clip');
	noClipSwitch.onChange((_, val) => {
		if (val) {
			if (!gameOver) gameOver = Runner.instance_.gameOver.bind(Runner.instance_);
			Runner.instance_.gameOver = () => {};
		} else {
			Runner.instance_.gameOver = gameOver;
		}
	});
	playerMods.append(noClipSwitch);

	playerMods.append(new cheatgui.Switch('Freeze').bind(Runner.instance_, 'playingIntro'));

	const airWalkSwitch = new cheatgui.Switch('Air walk');
	airWalkSwitch.onChange((_, val) => Runner.instance_.tRex.groundYPos = val ? 0 : 93);
	playerMods.append(airWalkSwitch);

	playerMods.append(new cheatgui.Switch('Bhop').bind(cheats, 'bhop'));

	const autoPlayFrequency = new cheatgui.Slider({
		label: 'Auto play frequency',
		min: 16,
		value: 100,
		max: 1000
	});
	playerMods.append(autoPlayFrequency);

	let autoPlayInterval;
	const autoPlaySwitch = new cheatgui.Switch('Auto play');
	autoPlaySwitch.onChange((_, val) => {
		if (val) {
			autoPlayInterval = setInterval(autoPlay, autoPlayFrequency.getValue());
		} else {
			clearInterval(autoPlayInterval);
		}
	});
	playerMods.append(autoPlaySwitch);
	
	playerMods.append(new cheatgui.Switch('Obstacle bypass').bind(cheats, 'obstacleBypass'));

	/******************************
	 ***** Visuals *****************
	 ******************************/

	visualMods.append(new cheatgui.Switch('Player ESP').bind(cheats, 'playerEsp'));

	visualMods.append(new cheatgui.Switch('ESP').bind(cheats, 'esp'));

	visualMods.append(new cheatgui.Switch('ESP Outline').bind(cheats, 'espOutline'));

	visualMods.append(new cheatgui.Switch('ESP info').bind(cheats, 'espInfo'));

	visualMods.append(new cheatgui.Switch('Text Outline').bind(cheats, 'textOutline'));

	visualMods.append(new cheatgui.Switch('Tracers').bind(cheats, 'tracers'));

	visualMods.append(new cheatgui.Switch('Tracers Outline').bind(cheats, 'tracersOutline'));

	visualMods.append(new cheatgui.Switch('Inner hitboxes').bind(cheats, 'hitboxes'));

	visualMods.append(new cheatgui.Switch('Black hitboxes').bind(cheats, 'blackHitboxes'));

	visualMods.append(new cheatgui.Switch('Outer hitboxes').bind(cheats, 'outerHitboxes'));

	visualMods.append(new cheatgui.Switch('Trajectory').bind(cheats, 'trajectory'));

	visualMods.append(new cheatgui.Switch('Jump helper').bind(cheats, 'jumpHelper'));

	visualMods.append(new cheatgui.Switch('Night sky').bind(Runner.instance_, 'inverted'));

	const invertBtn = new cheatgui.Button('Invert');
	invertBtn.onClick(() => {
		Runner.instance_.invertTrigger = !Runner.instance_.invertTrigger;
		Runner.instance_.invert();
	});
	visualMods.append(invertBtn);


	/******************************
	 ***** Obstacles ***************
	 ******************************/
	
	obstacleMods.append(new cheatgui.Button('Spawn obstacle').onClick(() => {
		Runner.instance_.horizon.addNewObstacle(Runner.instance_.currentSpeed);
	}));

	obstacleMods.append(new cheatgui.Button('Remove obstacle').onClick(() => {
		Runner.instance_.horizon.removeFirstObstacle();
	}));

	obstacleMods.append(new cheatgui.Switch('No obstacles').bind(cheats, 'noObstacles'));

	/******************************
	 ***** Miscs *******************
	 ******************************/

	let clickEventListener;
	miscMods.append(new cheatgui.Switch('Force focus').onChange((_, val) => {
		if (val) {
			clickEventListener = document.addEventListener('click', () => {
				Runner.instance_.canvas.focus();
			});
		} else {
			document.removeEventListener('click', clickEventListener);
		}
	}));

	miscMods.append(new cheatgui.Switch('Jump fix', true).bind(cheats, 'jumpFix'));

	/******************************
	 ***** Custom functions ********
	 ******************************/

	class CollisionBox {
		constructor(x, y, w, h) {
			this.x = x;
			this.y = y;
			this.width = w;
			this.height = h;
		}
	}

	function boxCompare(tRexBox, obstacleBox) {
		let crashed = false;

		let obstacleBoxX = obstacleBox.x;

		// Axis-Aligned Bounding Box method.
		if (tRexBox.x < obstacleBoxX + obstacleBox.width &&
			tRexBox.x + tRexBox.width > obstacleBoxX &&
			tRexBox.y < obstacleBox.y + obstacleBox.height &&
			tRexBox.height + tRexBox.y > obstacleBox.y) {
			crashed = true;
		}

		return crashed;
	}

	const Trex = {
		collisionBoxes: {
			DUCKING: [
				new CollisionBox(1, 18, 55, 25)
			],
			RUNNING: [
				new CollisionBox(22, 0, 17, 16),
				new CollisionBox(1, 18, 30, 9),
				new CollisionBox(10, 35, 14, 8),
				new CollisionBox(1, 24, 29, 5),
				new CollisionBox(5, 30, 21, 4),
				new CollisionBox(9, 34, 15, 4)
			]
		}
	};

	function createAdjustedCollisionBox(box, adjustment) {
		return new CollisionBox(
			box.x + adjustment.x,
			box.y + adjustment.y,
			box.width,
			box.height);
	}

	function drawCollisionBoxes(canvasCtx, tRexBox, obstacleBox) {
		if (!canvasCtx) return;
		canvasCtx.save();
		canvasCtx.strokeStyle = '#f00';
		canvasCtx.strokeRect(tRexBox.x, tRexBox.y, tRexBox.width, tRexBox.height);

		canvasCtx.strokeStyle = '#0f0';
		canvasCtx.strokeRect(obstacleBox.x, obstacleBox.y,
			obstacleBox.width, obstacleBox.height);
		canvasCtx.restore();
	};

	function checkForCollision(obstacle, tRex) {
		// Adjustments are made to the bounding box as there is a 1 pixel white
		// border around the t-rex and obstacles.
		const tRexBox = new CollisionBox(
			tRex.xPos + 1,
			tRex.yPos + 1,
			tRex.config.WIDTH - 2,
			tRex.config.HEIGHT - 2);

		const obstacleBox = new CollisionBox(
			obstacle.xPos + 1,
			obstacle.yPos + 1,
			obstacle.typeConfig.width * obstacle.size - 2,
			obstacle.typeConfig.height - 2);

		// Debug outer box
		if (cheats.outerHitboxes) {
			drawCollisionBoxes(Runner.instance_.canvasCtx, tRexBox, obstacleBox);
		}

		// Simple outer bounds check.
		if (boxCompare(tRexBox, obstacleBox)) {
			const collisionBoxes = obstacle.collisionBoxes;
			const tRexCollisionBoxes = tRex.ducking ?
				Trex.collisionBoxes.DUCKING : Trex.collisionBoxes.RUNNING;

			// Detailed axis aligned box check.
			for (let t = 0; t < tRexCollisionBoxes.length; t++) {
				for (let i = 0; i < collisionBoxes.length; i++) {
					// Adjust the box to actual positions.
					let adjTrexBox =
						createAdjustedCollisionBox(tRexCollisionBoxes[t], tRexBox);
					let adjObstacleBox =
						createAdjustedCollisionBox(collisionBoxes[i], obstacleBox);
					let crashed = boxCompare(adjTrexBox, adjObstacleBox);

					// Draw boxes for debug.
					// if (cheats.hitboxes) {
					// 	drawCollisionBoxes(Runner.instance_.canvasCtx, adjTrexBox, collisionBoxes[i]);
					// }

					if (crashed) {
						return [adjTrexBox, adjObstacleBox];
					}
				}
			}
		}
		return false;
	}

	Runner.instance_.update = (function() {
		this.updatePending = false;

		let now = performance.now();
		let deltaTime = now - (this.time || now);

		this.time = now;

		if (this.playing) {
			this.clearCanvas();

			if (this.tRex.jumping) {
				this.tRex.updateJump(deltaTime);
			}

			this.runningTime += deltaTime;
			let hasObstacles = this.runningTime > this.config.CLEAR_TIME;

			// First jump triggers the intro.
			if (this.tRex.jumpCount == 1 && !this.playingIntro) {
				this.playIntro();
			}

			// The horizon doesn't move until the intro is over.
			if (this.playingIntro) {
				this.horizon.update(0, this.currentSpeed, hasObstacles);
			} else {
				deltaTime = !this.activated ? 0 : deltaTime;
				this.horizon.update(deltaTime, this.currentSpeed, hasObstacles,
					this.inverted);
			}

			// Check for collisions.
			let collision = hasObstacles &&
				checkForCollision(this.horizon.obstacles[0], this.tRex);

			if (!collision) {
				this.distanceRan += this.currentSpeed * deltaTime / this.msPerFrame;

				if (this.currentSpeed < this.config.MAX_SPEED && !cheats.noSpeedIncrease) {
					this.currentSpeed += this.config.ACCELERATION;
				}
			} else if (cheats.obstacleBypass) {
				this.tRex.yPos = this.horizon.obstacles[0].yPos -
					this.horizon.obstacles[0].typeConfig.height - 2;
				Runner.instance_.tRex.midair = true;
				Runner.instance_.tRex.jumping = true;
				this.tRex.reachedMinHeight = false;
				this.tRex.jumpVelocity = 10;
			} else {
				this.gameOver();
			}

			let playAchievementSound = this.distanceMeter.update(deltaTime,
				Math.ceil(this.distanceRan));

			if (playAchievementSound) {
				this.playSound(this.soundFx.SCORE);
			}

			// Night mode.
			if (this.invertTimer > this.config.INVERT_FADE_DURATION) {
				this.invertTimer = 0;
				this.invertTrigger = false;
				this.invert();
			} else if (this.invertTimer) {
				this.invertTimer += deltaTime;
			} else {
				let actualDistance =
					this.distanceMeter.getActualDistance(Math.ceil(this.distanceRan));

				if (actualDistance > 0) {
					this.invertTrigger = !(actualDistance %
						this.config.INVERT_DISTANCE);

					if (this.invertTrigger && this.invertTimer === 0) {
						this.invertTimer += deltaTime;
						this.invert();
					}
				}
			}
		}

		if (this.playing || (!this.activated &&
				this.tRex.blinkCount < Runner.config.MAX_BLINK_COUNT)) {
			this.tRex.update(deltaTime);
		}

		const ctx = this.canvasCtx;
		ctx.save();
		ctx.strokeWidth = 1;
		ctx.globalAlpha = 1;
		this.horizon.obstacles.forEach(obstacle => {
			const isObstacleNearby =
				obstacle.xPos < 25 * this.currentSpeed - obstacle.width / 2;

			if (cheats.tracers) {
				if (cheats.tracersOutline) {
					ctx.strokeStyle = '#000';
					ctx.lineWidth = 3;
					ctx.beginPath();
					ctx.moveTo(this.tRex.xPos + this.tRex.config.WIDTH / 2, this.tRex.yPos);
					ctx.lineTo(obstacle.xPos + obstacle.width / 2, obstacle.yPos);
					ctx.stroke();
				}
				ctx.strokeStyle = isObstacleNearby ? '#f00' : '#ff0';
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.moveTo(this.tRex.xPos + this.tRex.config.WIDTH / 2, this.tRex.yPos);
				ctx.lineTo(obstacle.xPos + obstacle.width / 2, obstacle.yPos);
				ctx.stroke();
			}

			if (cheats.jumpHelper) {
				// TODO
			}

			if (cheats.esp) {
				if (cheats.espOutline) {
					ctx.strokeStyle = '#000';
					ctx.strokeWidth = 1;
					ctx.strokeRect(obstacle.xPos + 1, obstacle.yPos + 1,
						obstacle.width - 2, obstacle.typeConfig.height - 2);
					ctx.strokeRect(obstacle.xPos - 1, obstacle.yPos - 1,
						obstacle.width + 2, obstacle.typeConfig.height + 2);
				}
				ctx.strokeStyle = isObstacleNearby ? '#f00' : '#ff0';
				ctx.strokeWidth = 1;
				ctx.strokeRect(obstacle.xPos, obstacle.yPos,
					obstacle.width, obstacle.typeConfig.height);
			}

			if (cheats.espInfo) {
				ctx.font = "8px Arial";
				if (cheats.textOutline) {
					ctx.lineWidth = 2;
					ctx.strokeStyle = '#000';
					ctx.strokeText(obstacle.typeConfig.type, obstacle.xPos, obstacle.yPos - 10);
					ctx.strokeText('Size: ' + obstacle.size, obstacle.xPos, obstacle.yPos - 3);
				}
				ctx.fillStyle = cheats.textOutline ? (isObstacleNearby ? '#f00' : '#ff0') : '#000';
				ctx.fillText(obstacle.typeConfig.type, obstacle.xPos, obstacle.yPos - 10);
				ctx.fillText('Size: ' + obstacle.size, obstacle.xPos, obstacle.yPos - 3);
			}
		});

		if (cheats.playerEsp) {
			if (cheats.espOutline) {
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.strokeRect(this.tRex.xPos + 1, this.tRex.yPos + 1,
					this.tRex.config.WIDTH - 2, this.tRex.config.HEIGHT - 2);
				ctx.strokeRect(this.tRex.xPos - 1, this.tRex.yPos - 1,
					this.tRex.config.WIDTH + 2, this.tRex.config.HEIGHT + 2);
			}
			ctx.strokeStyle = '#0f0';
			ctx.lineWidth = 1;
			ctx.strokeRect(this.tRex.xPos, this.tRex.yPos,
				this.tRex.config.WIDTH, this.tRex.config.HEIGHT);
		}

		if (cheats.espInfo) {
			ctx.font = "8px Arial";
			if (cheats.textOutline) {
				ctx.lineWidth = 2;
				ctx.strokeStyle = '#000';
				ctx.strokeText('Speed: ' + this.currentSpeed.toFixed(2), this.tRex.xPos, this.tRex.yPos - 10);
				ctx.strokeText('Jump velocity: ' + this.tRex.jumpVelocity.toFixed(1), this.tRex.xPos, this.tRex.yPos - 3);
			}
			ctx.fillStyle = cheats.textOutline ? '#0f0' : '#000';
			ctx.fillText('Speed: ' + this.currentSpeed.toFixed(2), this.tRex.xPos, this.tRex.yPos - 10);
			ctx.fillText('Jump velocity: ' + this.tRex.jumpVelocity.toFixed(1), this.tRex.xPos, this.tRex.yPos - 3);
		}

		if (cheats.trajectory) {
			ctx.strokeStyle = '#000';
			ctx.strokeWidth = 1;
			drawTrajectory(ctx, this.tRex.xPos, this.tRex.yPos, this.tRex.config.WIDTH,
				this.tRex.config.HEIGHT, this.currentSpeed,
				this.tRex.jumpVelocity);
		}

		if (cheats.hitboxes && this.horizon.obstacles.length > 0) {
			const tRexBox = new CollisionBox(
				this.tRex.xPos + 1,
				this.tRex.yPos + 1,
				this.tRex.config.WIDTH - 2,
				this.tRex.config.HEIGHT - 2);
			const tRexCollisionBoxes = this.tRex.ducking ?
				Trex.collisionBoxes.DUCKING : Trex.collisionBoxes.RUNNING;
			const obstacle = this.horizon.obstacles[0];
			const obstacleBox = new CollisionBox(
				obstacle.xPos + 1,
				obstacle.yPos + 1,
				obstacle.typeConfig.width * obstacle.size - 2,
				obstacle.typeConfig.height - 2);
			const collisionBoxes = obstacle.collisionBoxes;

			ctx.lineWidth = 1;
			ctx.strokeStyle = '#0f0';

			for (let t = 0; t < tRexCollisionBoxes.length; t++) {
				const adjBox =
					createAdjustedCollisionBox(tRexCollisionBoxes[t], tRexBox);
				ctx.strokeRect(adjBox.x, adjBox.y, adjBox.width, adjBox.height);
			}

			ctx.strokeStyle = '#f00';
			for (let i = 0; i < collisionBoxes.length; i++) {
				const adjBox =
					createAdjustedCollisionBox(collisionBoxes[i], obstacleBox);
				ctx.strokeRect(adjBox.x, adjBox.y, adjBox.width, adjBox.height);
			}
		}

		if (cheats.blackHitboxes && this.horizon.obstacles.length > 0) {
			const tRexBox = new CollisionBox(
				this.tRex.xPos + 1,
				this.tRex.yPos + 1,
				this.tRex.config.WIDTH - 2,
				this.tRex.config.HEIGHT - 2);
			const tRexCollisionBoxes = this.tRex.ducking ?
				Trex.collisionBoxes.DUCKING : Trex.collisionBoxes.RUNNING;
			const obstacle = this.horizon.obstacles[0];
			const obstacleBox = new CollisionBox(
				obstacle.xPos + 1,
				obstacle.yPos + 1,
				obstacle.typeConfig.width * obstacle.size - 2,
				obstacle.typeConfig.height - 2);
			const collisionBoxes = obstacle.collisionBoxes;

			ctx.fillStyle = '#000';

			for (let t = 0; t < tRexCollisionBoxes.length; t++) {
				const adjBox =
					createAdjustedCollisionBox(tRexCollisionBoxes[t], tRexBox);
				ctx.fillRect(adjBox.x, adjBox.y, adjBox.width, adjBox.height);
			}

			for (let i = 0; i < collisionBoxes.length; i++) {
				const adjBox =
					createAdjustedCollisionBox(collisionBoxes[i], obstacleBox);
				ctx.fillRect(adjBox.x, adjBox.y, adjBox.width, adjBox.height);
			}
		}

		ctx.restore();

		if (this.playing || (!this.activated &&
				this.tRex.blinkCount < Runner.config.MAX_BLINK_COUNT)) {
			this.scheduleNextUpdate();
		}
	}).bind(Runner.instance_);

	Trex.animFrames = {
		WAITING: {
			frames: [44, 0],
			msPerFrame: 1000 / 3
		},
		RUNNING: {
			frames: [88, 132],
			msPerFrame: 1000 / 12
		},
		CRASHED: {
			frames: [220],
			msPerFrame: 1000 / 60
		},
		JUMPING: {
			frames: [0],
			msPerFrame: 1000 / 60
		},
		DUCKING: {
			frames: [264, 323],
			msPerFrame: 1000 / 8
		}
	};

	Runner.instance_.tRex.updateJump = (function(deltaTime, speed) {
		const msPerFrame = Trex.animFrames[this.status].msPerFrame;
		const framesElapsed = deltaTime / msPerFrame;

		// Speed drop makes Trex fall faster.
		if (this.speedDrop) {
			this.yPos += Math.round(this.jumpVelocity *
				this.config.SPEED_DROP_COEFFICIENT * framesElapsed);
		} else {
			this.yPos += Math.round(this.jumpVelocity * framesElapsed);
		}

		this.jumpVelocity += this.config.GRAVITY * framesElapsed;

		// Minimum height has been reached.
		if (this.yPos < this.minJumpHeight || this.speedDrop) {
			this.reachedMinHeight = true;
		}

		// Reached max height
		if (this.yPos < this.config.MAX_JUMP_HEIGHT || this.speedDrop) {
			this.endJump();
		}

		// Back down at ground level. Jump completed.
		if (this.yPos > this.groundYPos) {
			this.reset();
			this.jumpCount++;
			if (cheats.bhop) jump();
			if (cheats.jumpFix && isJumpDown) jump();
		}
	}).bind(Runner.instance_.tRex);

	Runner.instance_.horizon.updateObstacles = (function(deltaTime, currentSpeed) {
		// Obstacles, move to Horizon layer.
		const updatedObstacles = this.obstacles.slice(0);

		for (let i = 0; i < this.obstacles.length; i++) {
			const obstacle = this.obstacles[i];
			obstacle.update(deltaTime, currentSpeed);

			// Clean up existing obstacles.
			if (obstacle.remove) {
				updatedObstacles.shift();
			}
		}
		this.obstacles = updatedObstacles;

		if (this.obstacles.length > 0) {
			const lastObstacle = this.obstacles[this.obstacles.length - 1];

			if (lastObstacle && !lastObstacle.followingObstacleCreated &&
				lastObstacle.isVisible() &&
				(lastObstacle.xPos + lastObstacle.width + lastObstacle.gap) <
				this.dimensions.WIDTH) {
				this.addNewObstacle(currentSpeed);
				lastObstacle.followingObstacleCreated = true;
			}
		} else {
			// Create new obstacles.
			this.addNewObstacle(currentSpeed);
		}
	}).bind(Runner.instance_.horizon);

	function getRandomNum(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	
	const Obstacle = window.Obstacle;

	Runner.instance_.horizon.addNewObstacle = (function(currentSpeed) {
		const obstacleTypeIndex = getRandomNum(0, Obstacle.types.length - 1);
		const obstacleType = Obstacle.types[obstacleTypeIndex];

		// Check for multiples of the same type of obstacle.
		// Also check obstacle is available at current speed.
		if (this.duplicateObstacleCheck(obstacleType.type) ||
			currentSpeed < obstacleType.minSpeed) {
			this.addNewObstacle(currentSpeed);
		} else {
			const obstacleSpritePos = this.spritePos[obstacleType.type];

			this.obstacles.push(new Obstacle(this.canvasCtx, obstacleType,
				obstacleSpritePos, this.dimensions,
				this.gapCoefficient, currentSpeed, obstacleType.width));

			this.obstacleHistory.unshift(obstacleType.type);

			if (this.obstacleHistory.length > 1) {
				this.obstacleHistory.splice(Runner.config.MAX_OBSTACLE_DUPLICATION);
			}
		}
	}).bind(Runner.instance_.horizon);


	document.addEventListener('keydown', e => {
		if (e.code == 'Space' || e.code == 'ArrowUp') isJumpDown = true;
	});
	document.addEventListener('keyup', e => {
		if (e.code == 'Space' || e.code == 'ArrowUp') isJumpDown = false;
	});
	document.addEventListener('touchstart', e => {
		isJumpDown = true;
	});
	document.addEventListener('touchend', e => {
		isJumpDown = false;
	});

	/*****************************/

	function jump() {
		Runner.instance_.tRex.startJump(Runner.instance_.currentSpeed);
	}

	function dispatchKey(type, key) {
		document.dispatchEvent(new KeyboardEvent(type, { keyCode: key }));
	}

	function autoPlay() {
		const KEY_CODE_SPACE_BAR = 32
		const KEY_CODE_ARROW_DOWN = 40
		const CANVAS_HEIGHT = Runner.instance_.dimensions.HEIGHT
		const DINO_HEIGHT = Runner.instance_.tRex.config.HEIGHT

		const obstacle = Runner.instance_.horizon.obstacles[0]
		const speed = Runner.instance_.currentSpeed

		if (obstacle) {
			const w = obstacle.width
			const x = obstacle.xPos // measured from left of canvas
			const y = obstacle.yPos // measured from top of canvas
			const yFromBottom = CANVAS_HEIGHT - y - obstacle.typeConfig.height
			const isObstacleNearby = x < 25 * speed - w / 2

			if (isObstacleNearby) {
				if (yFromBottom > DINO_HEIGHT) {
					// Pterodactyl going from above, do nothing
				} else if (y > CANVAS_HEIGHT / 2) {
					// Jump
					dispatchKey("keyup", KEY_CODE_ARROW_DOWN)
					dispatchKey("keydown", KEY_CODE_SPACE_BAR)
				} else {
					// Duck
					dispatchKey("keydown", KEY_CODE_ARROW_DOWN)
				}
			}
		}
	}
}

function drawTrajectory(ctx, x, y, width, height, vx, vy) {
	// Calculate the initial position
	ctx.beginPath();
	ctx.moveTo(x + width / 2, y + height / 2);

	// Create a loop that iterates as long as the player's y position is less than 93
	while (y < 93) {
		// Calculate the next position of the player
		x += vx;
		y += vy;
		vy += Runner.instance_.tRex.config.GRAVITY;

		// Draw a line between the current position and the next position on the canvas
		ctx.lineTo(x + width / 2, y + height / 2);
	}

	ctx.stroke();
}

setTimeout(initCheats, 100);