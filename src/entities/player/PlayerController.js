// src/entities/player/PlayerController.js
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { gameState } from '../../core/gameState.js';
import { EventBus } from '../../core/utils/EventBus.js';
import { InputHandler } from '../../core/InputHandler.js';

export class PlayerController {
  constructor(camera, scene) {
    this.camera = camera;
    this.scene = scene;
    this.baseSpeed = 5;
    this.speed = this.baseSpeed;
    
    // Movement state
    this.movement = {
      forward: false,
      backward: false,
      left: false,
      right: false
    };
    
    // Physics
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    
    // Controls
    this.controls = new PointerLockControls(camera, document.body);
    scene.add(this.controls.object);
    
    // Effects state
    this.effects = {
      invertedControls: false,
      inQuicksand: false,
      quicksandStartY: null,
      quicksandTime: 0,
      stunned: false
    };

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Pointer lock on click
    document.addEventListener('click', () => {
      if (!gameState.gameOver) this.controls.lock();
    });

    // Input events
    EventBus.on(InputHandler.KEY_DOWN, (code) => this.handleKeyDown(code));
    EventBus.on(InputHandler.KEY_UP, (code) => this.handleKeyUp(code));
  }

  handleKeyDown(code) {
    switch (code) {
      case 'KeyW': this.movement.forward = true; break;
      case 'KeyS': this.movement.backward = true; break;
      case 'KeyA': this.movement.left = true; break;
      case 'KeyD': this.movement.right = true; break;
    }
  }

  handleKeyUp(code) {
    switch (code) {
      case 'KeyW': this.movement.forward = false; break;
      case 'KeyS': this.movement.backward = false; break;
      case 'KeyA': this.movement.left = false; break;
      case 'KeyD': this.movement.right = false; break;
    }
  }

  update(deltaTime) {
    if (!this.controls.isLocked || gameState.movementLocked) return;

    this.updateMovement(deltaTime);
    this.updateQuicksand(deltaTime);
  }

  updateMovement(deltaTime) {
    this.direction.set(0, 0, 0);
    
    const forward = this.effects.invertedControls ? -1 : 1;
    if (this.movement.forward) this.direction.z += 1 * forward;
    if (this.movement.backward) this.direction.z -= 1 * forward;
    if (this.movement.left) this.direction.x -= 1 * forward;
    if (this.movement.right) this.direction.x += 1 * forward;

    this.direction.normalize();

    const moveX = this.direction.x * this.speed * deltaTime;
    const moveZ = this.direction.z * this.speed * deltaTime;

    this.controls.moveRight(moveX);
    this.controls.moveForward(moveZ);
  }

  updateQuicksand(deltaTime) {
    if (!this.effects.inQuicksand) {
      this.effects.quicksandTime = 0;
      return;
    }

    const { object } = this.controls;
    this.effects.quicksandTime += deltaTime;

    // Sinking effect
    const minSink = this.effects.quicksandStartY - 0.5;
    if (object.position.y > minSink) {
      object.position.y = Math.max(minSink, object.position.y - 0.005);
    }

    // Stun after prolonged exposure
    if (!this.effects.stunned && this.effects.quicksandTime >= 7) {
      this.stunMovement(4, () => {
        this.effects.quicksandTime = 0;
        this.effects.stunned = false;
      });
    }
  }

  // --- Effect Methods ---
  setMovementSpeed(multiplier) {
    this.speed = this.baseSpeed * multiplier;
  }

  resetMovementSpeed() {
    this.speed = this.baseSpeed;
  }

  applyQuicksandEffect() {
    if (!this.effects.inQuicksand) {
      this.effects.inQuicksand = true;
      this.effects.quicksandStartY = this.controls.object.position.y;
      this.setMovementSpeed(0.1);
    }
  }

  exitQuicksand() {
    if (this.effects.inQuicksand) {
      this.controls.object.position.y = this.effects.quicksandStartY;
      this.effects.inQuicksand = false;
      this.resetMovementSpeed();
    }
  }

  invertControls(duration = 10) {
    this.effects.invertedControls = true;
    setTimeout(() => {
      this.effects.invertedControls = false;
    }, duration * 1000);
  }

  stunMovement(duration = 5, onComplete) {
    gameState.movementLocked = true;
    this.setMovementSpeed(0);

    setTimeout(() => {
      gameState.movementLocked = false;
      this.effects.stunned = false;
      this.setMovementSpeed(this.effects.inQuicksand ? 0.1 : 1);
      onComplete?.();
    }, duration * 1000);
  }

  // --- Control Methods ---
  releaseControls() {
    this.controls.unlock();
    document.exitPointerLock?.();
    document.body.style.cursor = 'auto';
  }

  reset() {
    this.releaseControls();
    this.movement = {
      forward: false,
      backward: false,
      left: false,
      right: false
    };
    this.resetMovementSpeed();
  }
}