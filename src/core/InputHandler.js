// src/core/input/InputHandler.js
import { EventBus } from './utils/EventBus.js';

export class InputHandler {
  static KEY_DOWN = 'input:key-down';
  static KEY_UP = 'input:key-up';

  constructor() {
    // Core movement keys (WASD by default)
    this.keyBindings = {
      moveForward: 'KeyW',
      moveBackward: 'KeyS',
      moveLeft: 'KeyA',
      moveRight: 'KeyD',
      useRune: 'KeyR'
    };

    this.keyStates = {};
    this.mouseState = {
      leftButton: false,
      position: { x: 0, y: 0 }
    };

    this.setupListeners();
  }

  setupListeners() {
    // Keyboard
    document.addEventListener('keydown', (e) => {
      this.keyStates[e.code] = true;
      EventBus.emit(InputHandler.KEY_DOWN, e.code);
      if (e.code === this.keyBindings.useRune) {
        EventBus.emit('input:use-rune');
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keyStates[e.code] = false;
      EventBus.emit(InputHandler.KEY_UP, e.code);
    });

    // Mouse
    document.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left click
        this.mouseState.leftButton = true;
        EventBus.emit('input:interact');
      }
    });

    document.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.mouseState.leftButton = false;
      }
    });

    document.addEventListener('mousemove', (e) => {
      this.mouseState.position.x = e.clientX;
      this.mouseState.position.y = e.clientY;
    });
  }

  getMovementVector() {
    const move = { x: 0, z: 0 };
    
    if (this.keyStates[this.keyBindings.moveForward]) move.z -= 1;
    if (this.keyStates[this.keyBindings.moveBackward]) move.z += 1;
    if (this.keyStates[this.keyBindings.moveLeft]) move.x -= 1;
    if (this.keyStates[this.keyBindings.moveRight]) move.x += 1;

    // Normalize diagonal movement
    if (move.x !== 0 || move.z !== 0) {
      const length = Math.sqrt(move.x * move.x + move.z * move.z);
      move.x /= length;
      move.z /= length;
    }

    return move;
  }

  isMouseDown() {
    return this.mouseState.leftButton;
  }

  update() {
    // Currently just handles mouse lock API
    if (document.pointerLockElement) {
      // Mouse look handled by PointerLockControls
    }
  }
}