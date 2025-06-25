import * as THREE from 'three';
import { gameState } from './gameState.js';
import { RuneEffects } from '../runes/RuneEffects.js';
import { RuneTypes } from '../runes/RuneTypes.js';
import { Tooltip } from '../ui/Tooltip.js';


export class InteractionManager {
  constructor(camera, scene, runeManager, doorManager, trapManager, interactables = [], hud = null, player = null) {
    this.camera = camera;
    this.scene = scene;
    this.runeManager = runeManager;
    this.doorManager = doorManager;
    this.trapManager = trapManager;
    this.interactables = interactables; // e.g. breakable walls, easter eggs
    this.hud = hud;
    this.player = player;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(0, 0); // screen center (for FPS)

    // Click to interact
    document.addEventListener('click', () => this.handleClick());
  }

  tooltip = new Tooltip(); // init once

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

  pickupRune(hitObject) {
    if (gameState.equippedRune) {
      this.hud?.showMessage("You already have a rune equipped!");
      return;
    }

    // 🔍 Find the actual top-level rune object
    const rune = this.runeManager.getRunes().find(r =>
      r === hitObject || r.children.includes(hitObject)
    );

    if (!rune) {
      console.warn("No valid rune found for pickup");
      return;
    }

    const runeData = RuneTypes[rune.name];
    if (runeData) {
      this.hud?.updateRuneDisplay(rune.name);
      this.hud?.showMessage(`Picked up ${runeData.label}`);
      this.tooltip.show(runeData.description);
    } else {
      this.hud?.updateRuneDisplay(rune.name);
    }

    gameState.equippedRune = rune.name;
    this.runeManager.removeRune(rune); // ✅ Remove from scene and list
  }


  useRune() {
    if (!gameState.equippedRune) {
      this.hud?.showMessage("No rune equipped!");
      return false;
    }

    const runeName = gameState.equippedRune;

    // Try to trigger a rune effect
    RuneEffects[runeName]?.activate?.(this.player, this.scene, this.hud);

    gameState.equippedRune = null;
    this.hud?.updateRuneDisplay(null);
    this.hud?.showMessage(`${runeName.replace("rune_", "")} rune used`);

    return true;
  }


  getEquippedRune() {
    return gameState.equippedRune;
  }

  update() {
    // Future: highlight rune when in focus, show door prompts, etc
  }
}
