import * as THREE from 'three';

// Constants
const TRIGGER_CONFIG = {
  ACTIVATION_DISTANCE: 1.0,
  MESSAGES: {
    LOCKED: "The door is locked! Activate the exit mechanism first."
  }
};

export class ExitTriggerZone {
  constructor(player, exitDoor, gameManager) {
    this.player = player;
    this.exitDoor = exitDoor;
    this.gameManager = gameManager;
    this.activated = false;
    this._boundingBox = new THREE.Box3();
    this._lastPosition = new THREE.Vector3();
    this._distanceThreshold = TRIGGER_CONFIG.ACTIVATION_DISTANCE;
  }

  update() {
    if (this.activated || !this.gameManager) return;

    const playerPos = this.player.controls.object.position;
    
    // Early exit if player hasn't moved significantly
    if (playerPos.distanceToSquared(this._lastPosition) < 0.01) return;
    this._lastPosition.copy(playerPos);

    const doorPos = this.exitDoor.getObject().position;
    const distance = playerPos.distanceTo(doorPos);

    if (distance < this._distanceThreshold) {
      this._handleExitAttempt();
    }
  }

  _handleExitAttempt() {
    if (!this.exitDoor.isUnlocked()) {
      this.gameManager.hud?.showMessage(TRIGGER_CONFIG.MESSAGES.LOCKED);
      return;
    }

    this.activated = true;
    this.gameManager.winGame();
  }

  reset() {
    this.activated = false;
    this._lastPosition.set(0, 0, 0);
  }

  dispose() {
    // Cleanup if needed
    this.player = null;
    this.exitDoor = null;
    this.gameManager = null;
  }

  // For debugging/visualization
  getDebugMesh() {
    const size = new THREE.Vector3(
      this._distanceThreshold * 2,
      this._distanceThreshold * 2,
      this._distanceThreshold * 2
    );
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(this.exitDoor.getObject().position);
    return mesh;
  }
}