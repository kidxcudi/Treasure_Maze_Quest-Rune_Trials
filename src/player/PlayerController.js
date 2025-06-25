import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export class PlayerController {
  constructor(camera, scene) {
    this.camera = camera;
    this.scene = scene;

    // Movement state
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.speed = 5;

    // Controls
    this.controls = new PointerLockControls(camera, document.body);
    scene.add(this.controls.getObject());

    // Pointer lock click to enable
    document.addEventListener('click', () => {
      this.controls.lock();
    });

    // Movement keys
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

    this.velocity.set(0, 0, 0);
    this.direction.set(0, 0, 0);

    if (this.moveForward) this.direction.z -= 1;
    if (this.moveBackward) this.direction.z += 1;
    if (this.moveLeft) this.direction.x += 1;
    if (this.moveRight) this.direction.x -= 1;

    this.direction.normalize();
    this.velocity.copy(this.direction).multiplyScalar(this.speed * deltaTime);

    this.controls.moveRight(this.velocity.x);
    this.controls.moveForward(this.velocity.z);
  }

  getObject() {
    return this.controls.getObject();
  }
}
