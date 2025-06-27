// src/exit/ExitTriggerZone.js

import * as THREE from 'three';

export class ExitTriggerZone {
  constructor(player, exitDoor, gameManager) {
    this.player = player;
    this.exitDoor = exitDoor;
    this.gameManager = gameManager;
    this.zone = new THREE.Box3();
    this.activated = false;
  }

  update() {
    if (this.activated || !this.exitDoor.isUnlocked()) return;

    const playerPos = this.player.controls.object.position.clone();
    const doorPos = this.exitDoor.getObject().position.clone();

    const distance = playerPos.distanceTo(doorPos);
    if (distance < 1) {
      this.activated = true;
      this.gameManager.winGame();
    }
  }
}
