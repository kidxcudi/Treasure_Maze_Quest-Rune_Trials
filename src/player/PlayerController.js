import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { gameState } from '../core/gameState.js';
import { animationSystem } from '../core/AnimationSystem.js';

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
    this.quicksandStartY = null;
    this.quicksandTotalTime = 0;
    this.quicksandStunned = false;
    this.stunMessageShown = false;

    this.idleBounceAnimId = null;

    // Bind handlers for proper removal
    this._clickHandler = () => { if (!gameState.gameOver) this.controls.lock(); };
    this._keyDownHandler = (e) => this.onKeyDown(e);
    this._keyUpHandler = (e) => this.onKeyUp(e);

    document.addEventListener('click', this._clickHandler);
    document.addEventListener('keydown', this._keyDownHandler);
    document.addEventListener('keyup', this._keyUpHandler);
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
    if (!this.controls.isLocked) {
      this._stopIdleBounce();
      return;
    }
    if (gameState.movementLocked) {
      this._stopIdleBounce();
      return;
    }

    this.velocity.set(0, 0, 0);
    this.direction.set(0, 0, 0);

    const forward = this.controlsInverted ? -1 : 1;
    if (this.moveForward) this.direction.z += 1 * forward;
    if (this.moveBackward) this.direction.z -= 1 * forward;
    if (this.moveLeft) this.direction.x -= 1 * forward;
    if (this.moveRight) this.direction.x += 1 * forward;

    this.direction.normalize();

    if (this.direction.length() === 0) {
      this._startIdleBounce();
    } else {
      this._stopIdleBounce();
    }

    const moveX = this.direction.x * this.speed * deltaTime;
    const moveZ = this.direction.z * this.speed * deltaTime;

    this.controls.moveRight(moveX);
    this.controls.moveForward(moveZ);

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
      this.quicksandTotalTime = 0;
      this.resetMovementSpeed();

      const obj = this.controls.object;
      const targetY = this.quicksandStartY;

      animationSystem.createTween({
        from: obj.position.y,
        to: targetY,
        duration: 0.5,
        easing: t => t * t * (3 - 2 * t),
        onUpdate: (value) => { obj.position.y = value; },
        onComplete: () => {
          this.quicksandStartY = null;
        }
      });

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
    this.setMovementSpeed(0);

    let elapsed = 0;
    const animId = animationSystem.addAnimation((delta) => {
      elapsed += delta;
      if (elapsed >= durationSeconds) {
        animationSystem.removeAnimation(animId);
        gameState.movementLocked = false;

        if (this.isInQuicksand) {
          this.setMovementSpeed(0.1);
        } else {
          this.resetMovementSpeed();
        }

        if (typeof onComplete === 'function') onComplete();
      }
    });
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

  _startIdleBounce() {
    if (this.idleBounceAnimId == null) {
      this.idleBounceAnimId = animationSystem.createIdleBounce(this.controls.object, {
        amplitude: 0.03,
        speed: 1.5,
      });
    }
  }

  _stopIdleBounce() {
    if (this.idleBounceAnimId != null) {
      animationSystem.removeAnimation(this.idleBounceAnimId);
      this.idleBounceAnimId = null;
      if (this.quicksandStartY != null) {
        this.controls.object.position.y = this.quicksandStartY;
      }
    }
  }

  /** Cleanup on dispose */
  dispose() {
    // Remove event listeners
    document.removeEventListener('click', this._clickHandler);
    document.removeEventListener('keydown', this._keyDownHandler);
    document.removeEventListener('keyup', this._keyUpHandler);

    // Remove animations
    if (this.idleBounceAnimId != null) {
      animationSystem.removeAnimation(this.idleBounceAnimId);
      this.idleBounceAnimId = null;
    }

    // Remove controls from scene
    this.scene.remove(this.controls.object);
    this.controls.dispose?.();
  }
}
