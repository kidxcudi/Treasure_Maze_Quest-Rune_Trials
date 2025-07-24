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
    this.quicksandStartY = null;      // Y pos when entering quicksand
    this.quicksandTotalTime = 0;      // Accumulate time in quicksand
    this.quicksandStunned = false;    // If player is currently stunned by quicksand
    this.stunMessageShown = false;    // To avoid repeating message during stun

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
    if (!this.controls.isLocked) return;
    if (gameState.movementLocked) return;

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

    // Quicksand logic
    if (this.isInQuicksand) {
      this.quicksandTotalTime += deltaTime;

      const obj = this.controls.object;
      const minSink = this.quicksandStartY - 0.5;

      if (obj.position.y > minSink) {
        obj.position.y -= 0.005;
        if (obj.position.y < minSink) obj.position.y = minSink;
      } else {
        obj.position.y = minSink;
      }

      if (!this.quicksandStunned && this.quicksandTotalTime >= 7) {
        this.quicksandStunned = true;
        this.stunMovement(4, () => {
          this.quicksandTotalTime = 0;
          this.quicksandStunned = false;
        });
      }
    } else {
      // Reset sinking timer when out of quicksand
      this.quicksandTotalTime = 0;
      this.stunMessageShown = false;
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
      this.quicksandStartY = this.controls.object.position.y;
      this.setMovementSpeed(0.1);
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

  stunMovement(durationSeconds = 5, onComplete = null) {
    gameState.movementLocked = true;
    this.setMovementSpeed(0); // fully stop movement during stun

    setTimeout(() => {
      gameState.movementLocked = false;
      
      // If still in quicksand, slow speed, else normal
      if (this.isInQuicksand) {
        this.setMovementSpeed(0.1);
      } else {
        this.resetMovementSpeed();
      }

      if (typeof onComplete === 'function') onComplete();
    }, durationSeconds * 1000);
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
