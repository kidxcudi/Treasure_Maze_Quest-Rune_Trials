// src/exit/DoorManager.js
export class DoorManager {
  constructor(exitDoor, gameManager) {
    this.exitDoor = exitDoor;
    this.gameManager = gameManager;
    this.doors = new Map(); // Using Map for better performance with object keys

    this._initializeExitDoor();
  }

  _initializeExitDoor() {
    const doorData = {
      mesh: this.exitDoor.getObject(),
      isOpen: false,
      locked: true,
      type: 'exit'
    };
    this.doors.set(doorData.mesh, doorData);
    this.exitDoor.setLocked(); // Use class method instead of direct material access
  }

  getDoors() {
    return Array.from(this.doors.values()).map(d => d.mesh);
  }

  tryOpenDoor(doorMesh) {
    const doorData = this.doors.get(doorMesh);
    if (!doorData) return false;

    if (doorData.locked) {
      this._showMessage("The door is locked! Activate the exit mechanism first.");
      return false;
    }

    if (doorData.isOpen) {
      this._showMessage("The door is already open. You can exit.");
      return true;
    }

    return this._openDoor(doorData);
  }

  _openDoor(doorData) {
    doorData.isOpen = true;
    this.exitDoor.setOpen();
    this._showMessage("The door is open! Go!");
    console.log("🚪 Door is now passable");
    return true;
  }

  _showMessage(message) {
    this.gameManager?.hud?.showMessage(message);
  }

  unlock() {
    const [firstDoor] = this.doors.values();
    if (!firstDoor) return false;

    firstDoor.locked = false;
    this.exitDoor.setUnlocked();
    console.log("🔓 Door unlocked!");
    return true;
  }

  isDoorLocked() {
    const [firstDoor] = this.doors.values();
    return firstDoor?.locked ?? true;
  }

  isDoorOpen() {
    const [firstDoor] = this.doors.values();
    return firstDoor?.isOpen ?? false;
  }

  reset() {
    this.doors.forEach(doorData => {
      doorData.isOpen = false;
      doorData.locked = true;
    });
    this.exitDoor.resetVisual();
  }

  dispose() {
    this.doors.clear();
    this.exitDoor = null;
    this.gameManager = null;
  }
}