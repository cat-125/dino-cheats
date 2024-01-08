const cheats = {
	esp: false,
	espInfo: false,
	tracers: false,
	hitboxes: false,
	outerHitboxes: false,
	jumpHelper: false
};

function initCheats() {
	const win = new cheatgui.Window({
		x: window.innerWidth - 615,
		y: window.innerHeight - 445,
		height: 400,
		width: 600,
		title: 'Cheats'
	});

	let gameOver = null;

	const globalMods = new cheatgui.Tree('Game');
	win.append(globalMods);

	const playerMods = new cheatgui.Tree('Player');
	win.append(playerMods);

	const visualMods = new cheatgui.Tree('Visuals');
	win.append(visualMods);

	const obstcaleMods = new cheatgui.Tree('Obstcales');
	win.append(obstcaleMods);

	const miscMods = new cheatgui.Tree('Miscs');
	win.append(miscMods);

	/******************************
	***** Game ********************
	******************************/

	const scoreInput = new cheatgui.Input('Score');
	const scoreBtn = new cheatgui.Button('Set score');
	scoreBtn.onClick(() => {
		const val = scoreInput.getText();

		if (!isNaN(+val)) Runner.instance_.distanceRan = +val / Runner.instance_.distanceMeter.config.COEFFICIENT;
	});
	globalMods.append(scoreInput);
	globalMods.append(scoreBtn);

	const gameOverBtn = new cheatgui.Button('End game');
	gameOverBtn.onClick(() => {
		if (!gameOver) gameOver = Runner.instance_.gameOver.bind(Runner.instance_);
		gameOver();
	});
	globalMods.append(gameOverBtn);


	/******************************
	***** Player ******************
	******************************/

	const speedInput = new cheatgui.Input('Speed');
	const speedBtn = new cheatgui.Button('Set speed', 8);
	speedBtn.onClick(() => {
		const val = speedInput.getText();

		if (!isNaN(+val)) Runner.instance_.currentSpeed = +val;
	});
	playerMods.append(speedInput);
	playerMods.append(speedBtn);

	const jumpHeightInput = new cheatgui.Input('Jump height');
	const jumpHeightBtn = new cheatgui.Button('Set jump height', 10);
	jumpHeightBtn.onClick(() => {
		const val = jumpHeightInput.getText();

		if (!isNaN(+val)) Runner.instance_.tRex.setJumpVelocity(+val);
	});
	playerMods.append(jumpHeightInput);
	playerMods.append(jumpHeightBtn);

	const noClipSwitch = new cheatgui.Switch('No clip');
	noClipSwitch.onChange((_, val) => {
		if (val) {
			if (!gameOver) gameOver = Runner.instance_.gameOver.bind(Runner.instance_);
			Runner.instance_.gameOver = () => { };
		} else {
			Runner.instance_.gameOver = gameOver;
		}
	});
	playerMods.append(noClipSwitch);

	const freezeSwitch = new cheatgui.Switch('Freeze');
	freezeSwitch.onChange((_, val) => {
		Runner.instance_.playingIntro = val;
	});
	playerMods.append(freezeSwitch);

	const airWalkSwitch = new cheatgui.Switch('Air walk');
	airWalkSwitch.onChange((_, val) => {
		Runner.instance_.tRex.groundYPos = val ? 0 : 93;
	});
	playerMods.append(airWalkSwitch);

	let autoPlayInterval;
	const autoPlaySwitch = new cheatgui.Switch('Auto play');
	autoPlaySwitch.onChange((_, val) => {
		if (val) {
			setInterval(autoPlay, 100);
		} else {
			clearInterval(autoPlayInterval);
		}
	});
	playerMods.append(autoPlaySwitch);

	/******************************
	***** Visuals *****************
	******************************/

	const espSwitch = new cheatgui.Switch('ESP');
	espSwitch.onChange((_, val) => cheats.esp = val);
	visualMods.append(espSwitch);

	const espInfoSwitch = new cheatgui.Switch('ESP info');
	espInfoSwitch.onChange((_, val) => cheats.espInfo = val);
	visualMods.append(espInfoSwitch);

	const tracersSwitch = new cheatgui.Switch('Tracers');
	tracersSwitch.onChange((_, val) => cheats.tracers = val);
	visualMods.append(tracersSwitch);

	const hitboxesSwitch = new cheatgui.Switch('Show inner hitboxes');
	hitboxesSwitch.onChange((_, val) => cheats.hitboxes = val);
	visualMods.append(hitboxesSwitch);

	const outerHitboxesSwitch = new cheatgui.Switch('Show outer hitboxes');
	outerHitboxesSwitch.onChange((_, val) => cheats.outerHitboxes = val);
	visualMods.append(outerHitboxesSwitch);

	const jumpHelperSwitch = new cheatgui.Switch('Jump helper');
	jumpHelperSwitch.onChange((_, val) => cheats.jumpHelper = val);
	visualMods.append(jumpHelperSwitch);

	const moonSwitch = new cheatgui.Switch('Night sky');
	moonSwitch.onChange((_, val) => Runner.instance_.inverted = val);
	visualMods.append(moonSwitch);

	const invertBtn = new cheatgui.Button('Invert');
	invertBtn.onClick(() => {
		Runner.instance_.invertTrigger = !Runner.instance_.invertTrigger;
		Runner.instance_.invert();
	});
	visualMods.append(invertBtn);


	/******************************
	***** Obstcales ***************
	******************************/

	const spawnObstcaleBtn = new cheatgui.Button('Spawn obstcale');
	spawnObstcaleBtn.onClick(() => {
		Runner.instance_.horizon.addNewObstacle(Runner.instance_.currentSpeed);
	});
	obstcaleMods.append(spawnObstcaleBtn);

	/******************************
	***** Miscs *******************
	******************************/

	let clickEventListener;
	const forceFocusSwitch = new cheatgui.Switch('Force focus');
	forceFocusSwitch.onChange((_, val) => {
		if (val) {
			blurEventListener = document.addEventListener('click', () => {
				Runner.instance_.canvas.focus();
			});
		} else {
			document.removeEventListener('click', clickEventListener);
		}
	});
	miscMods.append(forceFocusSwitch);

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

	Runner.instance_.update = (function () {
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

				if (this.currentSpeed < this.config.MAX_SPEED) {
					this.currentSpeed += this.config.ACCELERATION;
				}
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
			if (cheats.tracers && this.horizon.obstacles.length > 0 && this.canvasCtx) {
				ctx.save();
				ctx.strokeStyle = '#0f0';
				ctx.beginPath();
				ctx.moveTo(this.tRex.xPos + this.tRex.config.WIDTH / 2, this.tRex.yPos);
				ctx.lineTo(obstacle.xPos + obstacle.width / 2, obstacle.yPos);
				ctx.stroke();
			}

			if (cheats.jumpHelper) {
				drawTrajectory(ctx, this.tRex.xPos, this.tRex.yPos, this.tRex.config.WIDTH,
					this.tRex.config.HEIGHT, this.currentSpeed,
					this.tRex.jumpVelocity,
					this.tRex.config.GRAVITY);
			}

			if (cheats.esp) {
				const isObstacleNearby =
					obstacle.xPos < 25 * this.currentSpeed - obstacle.width / 2;
				ctx.strokeStyle = isObstacleNearby ? '#f00' : '#0f0';
				ctx.strokeRect(obstacle.xPos, obstacle.yPos,
					obstacle.width, obstacle.typeConfig.height);
			}

			if (cheats.espInfo) {
				ctx.fillStyle = '#000';
				ctx.font = "8px Arial";
				ctx.fillText("Type: " + obstacle.typeConfig.type, obstacle.xPos, obstacle.yPos - 10);
			}
		});
		ctx.restore();

		if (cheats.hitboxes) {
			const tRexBox = new CollisionBox(
				this.tRex.xPos + 1,
				this.tRex.yPos + 1,
				this.tRex.config.WIDTH - 2,
				this.tRex.config.HEIGHT - 2);
			const tRexCollisionBoxes = this.tRex.ducking ?
				Trex.collisionBoxes.DUCKING : Trex.collisionBoxes.RUNNING;
			const obstacle = this.horizon.obstacles[0]
			const obstacleBox = new CollisionBox(
				obstacle.xPos + 1,
				obstacle.yPos + 1,
				obstacle.typeConfig.width * obstacle.size - 2,
				obstacle.typeConfig.height - 2);
			const collisionBoxes = obstacle.collisionBoxes;

			for (let t = 0; t < tRexCollisionBoxes.length; t++) {
				for (let i = 0; i < collisionBoxes.length; i++) {
					// Adjust the box to actual positions.
					const adjTrexBox =
						createAdjustedCollisionBox(tRexCollisionBoxes[t], tRexBox);
					const adjObstacleBox =
						createAdjustedCollisionBox(collisionBoxes[i], obstacleBox);

					// Draw boxes for debug.
					drawCollisionBoxes(Runner.instance_.canvasCtx, adjTrexBox, adjObstacleBox);
				}
			}
		}

		if (this.playing || (!this.activated &&
			this.tRex.blinkCount < Runner.config.MAX_BLINK_COUNT)) {
			this.scheduleNextUpdate();
		}
	}).bind(Runner.instance_);

	/*****************************/

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

function drawTrajectory(ctx, x, y, width, height, vx, vy, gravity) {
	const cfg = Runner.instance_.tRex.config;

	// Calculate the initial position
	ctx.beginPath();
	ctx.moveTo(x + width / 2, y + height / 2);

	let speedDrop = false;

	// Create a loop that iterates as long as the player's y position is less than 93
	while (y < 93) {
		// Calculate the next position of the player
		x += vx;
		y += speedDrop ? vy * cfg.SPEED_DROP_COEFFICENT : vy;
		vy += gravity;

		// Draw a line between the current position and the next position on the canvas
		ctx.lineTo(x + width / 2, y + height / 2);

		if (y < cfg.MAX_JUMP_HEIGHT) speedDrop = true;
	}

	ctx.stroke();
}

setTimeout(initCheats, 100);