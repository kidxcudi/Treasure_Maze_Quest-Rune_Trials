import * as THREE from 'three';
import { gameState } from './gameState.js';

export class InteractionManager {
  constructor(camera, scene, runeManager, doorManager, trapManager, interactables = [], hud = null) {
    this.camera = camera;
    this.scene = scene;
    this.runeManager = runeManager;
    this.doorManager = doorManager;
    this.trapManager = trapManager;
    this.interactables = interactables; // e.g. breakable walls, easter eggs
    this.hud = hud;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(0, 0); // screen center (for FPS)

    // Click to interact
    document.addEventListener('click', () => this.handleClick());
  }

  handleClick() {
    if (!this.camera || !this.scene) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // 🎯 Rune Pickup
    const runeHits = this.raycaster.intersectObjects(this.runeManager.getRunes(), true);
    if (runeHits.length > 0) {
      this.pickupRune(runeHits[0].object);
      return;
    }

    // 🚪 Door Interactions
    if (this.doorManager) {
      const doorHits = this.raycaster.intersectObjects(this.doorManager.getDoors(), true);
      if (doorHits.length > 0) {
        this.doorManager.tryOpenDoor(doorHits[0].object, gameState.equippedRune);
        return;
      }
    }

    // 💀 Traps or Fakes
    if (this.trapManager) {
      const trapHits = this.raycaster.intersectObjects(this.trapManager.getTraps(), true);
      if (trapHits.length > 0) {
        this.trapManager.triggerTrap(trapHits[0].object);
        return;
      }
    }

    // 🧱 Secret Interactables (like breakable walls)
    for (let obj of this.interactables) {
      const hits = this.raycaster.intersectObject(obj, true);
      if (hits.length > 0 && gameState.equippedRune) {
        // Example: break wall with correct rune
        if (obj.userData.requiredRune === gameState.equippedRune) {
          console.log(`Used ${gameState.equippedRune} on ${obj.name}`);
          this.useRune();
          this.scene.remove(obj); // Remove wall
        } else {
          console.log("Wrong rune!");
        }
        return;
      }
    }
  }
  
  pickupRune(rune) {
    if (gameState.equippedRune) {
      this.hud?.showMessage("You already have a rune equipped!");
      return;
    }

    gameState.equippedRune = rune.name;
    this.runeManager.removeRune(rune);
    this.hud?.updateRuneDisplay(rune.name);
    this.hud?.showMessage(`Picked up ${rune.name.replace('rune_', '')} rune.`);
    // TODO: Trigger rune UI update or effect (like icon flash)
  }

  useRune() {
    if (!gameState.equippedRune) {
      this.hud?.showMessage("No rune equipped!");
      return false;
    }

    const used = gameState.equippedRune;
    this.hud?.showMessage(`${used.replace('rune_', '')} rune used`);
    gameState.equippedRune = null;
    this.hud?.updateRuneDisplay(null);
    return true;
  }

  getEquippedRune() {
    return gameState.equippedRune;
  }

  update() {
    // Future: highlight rune when in focus, show door prompts, etc
  }
}
