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
    if (this.activated) return;

    const playerPos = this.player.controls.object.position.clone();
    const doorPos = this.exitDoor.getObject().position.clone();

    const distance = playerPos.distanceTo(doorPos);
    if (distance < 1) {
      if (!this.exitDoor.isUnlocked()) {
        this.gameManager?.hud?.showMessage("The door is locked! Activate the exit mechanism first.");
        return;
      }

      this.activated = true;
      this.gameManager.winGame();
    }
  }
}
