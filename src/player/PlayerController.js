import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { gameState } from '../core/gameState.js';
import { maze1 } from '../maze/mazeLayout.js'; // <-- Adjust path if needed

const tileSize = maze1.tileSize;

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
    this.speed = 5;
    this.controlsInverted = false;

    this.controls = new PointerLockControls(camera, document.body);
    scene.add(this.controls.object);

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
  }

  setSpeedMultiplier(multiplier) {
    this.speed = 5 * multiplier;
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
