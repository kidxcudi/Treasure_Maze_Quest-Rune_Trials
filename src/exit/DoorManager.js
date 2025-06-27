// src/exit/DoorManager.js
export class DoorManager {
  constructor(exitDoor, gameManager) {
    this.exitDoor = exitDoor;
    this.gameManager = gameManager;

    this.doors = [{
      mesh: this.exitDoor.getObject(),
      isOpen: false,
      locked: true
    }];

    this.doors[0].mesh.material.color.set(0xffffff); // locked color
  }

  getDoors() {
    return this.doors.map(d => d.mesh);
  }

  tryOpenDoor(doorMesh) {
    const doorData = this.doors.find(d => d.mesh === doorMesh);
    if (!doorData) return;

    if (doorData.locked) {
      this.gameManager?.hud?.showMessage("The door is locked! Activate the exit mechanism first.");
      return;
    }

    if (doorData.isOpen) {
      this.gameManager?.hud?.showMessage("The door is already open. You can exit.");
      return;
    }

    doorData.isOpen = true;
    this.exitDoor.setOpen(); 

    this.gameManager?.hud?.showMessage("The door is open! Go!");
    console.log("🚪 Door is now passable");
  }

  unlock() {
    const doorData = this.doors[0];
    if (!doorData) return;

    doorData.locked = false;
    this.exitDoor.setUnlocked(); // ✅ use method, not mesh.material
    console.log("🔓 Door unlocked!");
  }

  isDoorLocked() {
    return this.doors[0]?.locked ?? true;
  }

  isDoorOpen() {
    return this.doors[0]?.isOpen ?? false;
  }
}
