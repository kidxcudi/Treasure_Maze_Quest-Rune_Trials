import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { gameState } from '../core/gameState.js';

export class PlayerController {
  constructor(camera, scene) {
    this.camera = camera;
    this.scene = scene;

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;

    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.baseSpeed = 5;
    this.speed = this.baseSpeed;
    this.controlsInverted = false;

    this.controls = new PointerLockControls(camera, document.body);
    scene.add(this.controls.object);

    // Quicksand state
    this.isInQuicksand = false;
    this.quicksandTimer = 0;
    this.quicksandStartY = null; // Store starting Y when entering quicksand

    document.addEventListener('click', () => {
      if (!gameState.gameOver) this.controls.lock();
    });

    document.addEventListener('keydown', (e) => this.onKeyDown(e));
    document.addEventListener('keyup', (e) => this.onKeyUp(e));
  }

  onKeyDown(event) {
    switch (event.code) {
      case 'KeyW': this.moveForward = true; break;
      case 'KeyS': this.moveBackward = true; break;
      case 'KeyA': this.moveLeft = true; break;
      case 'KeyD': this.moveRight = true; break;
    }
  }

  onKeyUp(event) {
    switch (event.code) {
      case 'KeyW': this.moveForward = false; break;
      case 'KeyS': this.moveBackward = false; break;
      case 'KeyA': this.moveLeft = false; break;
      case 'KeyD': this.moveRight = false; break;
    }
  }

  update(deltaTime) {
    if (gameState.movementLocked || !this.controls.isLocked) return;

    this.velocity.set(0, 0, 0);
    this.direction.set(0, 0, 0);

    const forward = this.controlsInverted ? -1 : 1;
    if (this.moveForward) this.direction.z += 1 * forward;
    if (this.moveBackward) this.direction.z -= 1 * forward;
    if (this.moveLeft) this.direction.x -= 1 * forward;
    if (this.moveRight) this.direction.x += 1 * forward;

    this.direction.normalize();

    const moveX = this.direction.x * this.speed * deltaTime;
    const moveZ = this.direction.z * this.speed * deltaTime;

    this.controls.moveRight(moveX);
    this.controls.moveForward(moveZ);

    if (this.isInQuicksand) {
      this.quicksandTimer += deltaTime;

      const obj = this.controls.object;
      const minSink = this.quicksandStartY - 0.5; // max sinking depth
      if (obj.position.y > minSink) {
        obj.position.y -= 0.005; // sink slowly
        if (obj.position.y < minSink) obj.position.y = minSink; // clamp
      }

      // if (this.quicksandTimer > 5) {
      //   console.log("⚠ Quicksand: You've been trapped too long!");
      //   gameState.movementLocked = true; // optional trap lock
      //   this.exitQuicksand();
      // }
    }
  }

  setMovementSpeed(multiplier) {
    this.speed = this.baseSpeed * multiplier;
  }

  resetMovementSpeed() {
    this.speed = this.baseSpeed;
  }

  applyQuicksandEffect() {
    if (!this.isInQuicksand) {
      this.isInQuicksand = true;
      this.quicksandTimer = 0;
      this.quicksandStartY = this.controls.object.position.y;
      this.setMovementSpeed(0.1);  // slow down
    }
  }

  exitQuicksand() {
    if (this.isInQuicksand) {
      this.isInQuicksand = false;
      this.quicksandTimer = 0;
      this.resetMovementSpeed();

      const obj = this.controls.object;
      obj.position.y = this.quicksandStartY; // reset height exactly
      this.quicksandStartY = null;

      // Unlock movement if locked
      if (gameState.movementLocked) {
        gameState.movementLocked = false;
      }
    }
  }

  invertControls(stepDuration = 10) {
    this.controlsInverted = true;
    gameState.invertedSteps = 0;
    gameState.maxInvertedSteps = stepDuration;

    const stepHandler = () => {
      gameState.invertedSteps++;
      if (gameState.invertedSteps >= gameState.maxInvertedSteps) {
        this.controlsInverted = false;
        window.removeEventListener('keydown', stepHandler);
      }
    };

    window.addEventListener('keydown', stepHandler);
  }

  stunMovement(stepDuration = 5) {
    gameState.movementLocked = true;
    gameState.stunSteps = 0;
    gameState.maxStunSteps = stepDuration;

    const stepHandler = () => {
      gameState.stunSteps++;
      if (gameState.stunSteps >= gameState.maxStunSteps) {
        gameState.movementLocked = false;
        window.removeEventListener('keydown', stepHandler);
      }
    };

    window.addEventListener('keydown', stepHandler);
  }

  applyEffectDuration(effectName, steps, onExpire) {
    let stepCount = 0;
    const stepListener = () => {
      stepCount++;
      if (stepCount >= steps) {
        window.removeEventListener('keydown', stepListener);
        onExpire?.();
      }
    };
    window.addEventListener('keydown', stepListener);
  }
}
