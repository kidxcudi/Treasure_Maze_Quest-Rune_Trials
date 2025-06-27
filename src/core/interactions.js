import * as THREE from 'three';
import { gameState } from './gameState.js';
import { RuneEffects } from '../runes/RuneEffects.js';
import { RuneTypes } from '../runes/RuneTypes.js';
import { Tooltip } from '../ui/Tooltip.js';

export class InteractionManager {
  constructor(
    camera,
    scene,
    runeManager,
    doorManager,
    trapManager,
    interactables = [],
    hud = null,
    player = null,
    gameManager = null,
    maze = null,
    uiManager = null,
    treasureManager = null
  ) {
    this.camera = camera;
    this.scene = scene;
    this.runeManager = runeManager;
    this.doorManager = doorManager;
    this.trapManager = trapManager;
    this.interactables = interactables;
    this.hud = hud;
    this.player = player;
    this.gameManager = gameManager;
    this.maze = maze;
    this.uiManager = uiManager;
    this.treasureManager = treasureManager;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(0, 0);

    document.addEventListener('click', (e) => {
      if (gameState.gameOver) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      this.handleClick();
    });
  }

  tooltip = new Tooltip();

  removeInteractable(object) {
  if (!object || !this.interactables) {
    console.warn("🔥 Invalid object or interactables array");
    return false;
  }

  // Debug: Log before removal
  console.groupCollapsed(`🔥 Removing interactable: ${object.name || object.uuid}`);
  console.log("Current interactables:", this.interactables.length);
  console.log("Object details:", object);

  // 1. Remove from interactables array
  const index = this.interactables.findIndex(
    item => item === object || item.uuid === object.uuid
  );
  
  if (index !== -1) {
    this.interactables.splice(index, 1);
    console.log("✅ Removed from interactables array");
  } else {
    console.warn("❌ Object not found in interactables");
  }

  // 2. Remove from scene if it exists there
  if (object.parent === this.scene) {
    this.scene.remove(object);
    console.log("✅ Removed from scene");
  } else if (object.parent) {
    console.warn(`⚠️ Object parent is ${object.parent.type}, not scene`);
  }

  // 3. Clean up any residual references
  if (object.userData) {
    object.userData.isInteractable = false;
    object.userData.isObstacle = false;
  }

  console.groupEnd();
  return true;
}

  handleClick() {
    if (!this.camera || !this.scene) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.raycaster.far = 3;

    // Rune pickup
    const runeHits = this.raycaster.intersectObjects(this.runeManager.getRunes(), true);
    if (runeHits.length > 0) {
      this.pickupRune(runeHits[0].object).catch(console.error);
      return;
    }

    // Exit mechanism
    const mech = this.scene.getObjectByName("exit_mechanism");
    if (mech && !this.gameManager?.isExitActivated?.()) {
      const mechHit = this.raycaster.intersectObject(mech, true);
      if (mechHit.length > 0) {
        if (gameState.treasuresCollected >= gameState.totalTreasures) {
          console.log("✅ All treasures collected. Exit activated.");
          this.scene.remove(mech);
          this.hud?.showMessage("Exit activated! Hurry!");
          this.gameManager?.triggerExitTimer?.();
        } else {
          const missing = gameState.totalTreasures - gameState.treasuresCollected;
          this.hud?.showMessage(`You still need ${missing} treasure${missing > 1 ? 's' : ''}...`);
        }
        return;
      }
    }

    // Exit door
    if (this.doorManager) {
      const doorHits = this.raycaster.intersectObjects(this.doorManager.getDoors(), true);
      if (doorHits.length > 0) {
        this.doorManager.tryOpenDoor(doorHits[0].object);
        return;
      }
    }

    // Trap trigger
    if (this.trapManager) {
      const trapHits = this.raycaster.intersectObjects(this.trapManager.getTraps(), true);
      if (trapHits.length > 0) {
        this.trapManager.triggerTrap(trapHits[0].object);
        return;
      }
    }

    // Treasure pickup
    if (this.treasureManager) {
      const treasureHits = this.raycaster.intersectObjects(this.treasureManager.getTreasures(), true);
      if (treasureHits.length > 0) {
        this.treasureManager.collect(treasureHits[0].object);
        return;
      }
    }

    // Interactable rune-use targets
    for (let obj of this.interactables) {
      const hits = this.raycaster.intersectObject(obj, true);
      if (hits.length > 0 && gameState.equippedRune) {
        if (obj.userData.requiredRune === gameState.equippedRune) {
          this.useRune();
          this.removeInteractable(obj); // <-- use the removal helper here
        } else {
          console.log("Wrong rune!");
        }
        return;
      }
    }
  }

  async pickupRune(hitObject) {
    if (gameState.equippedRune) {
      this.hud?.showMessage("You already have a rune equipped!");
      return;
    }

    const rune = this.runeManager.getRunes().find(r =>
      r === hitObject || r === hitObject.parent || (r.children && r.children.includes(hitObject))
    );

    if (!rune) {
      console.warn("No valid rune found for pickup");
      return;
    }

    const runeName = rune.name;
    const runeData = RuneTypes[runeName];

    if (!runeData) {
      console.warn("Unknown rune data:", runeName);
      return;
    }

    this.runeManager.removeRune(rune);
    this.hud?.updateRuneDisplay(runeName);
    this.hud?.showMessage(`Picked up ${runeData.label}`);
    this.tooltip.show(runeData.description);

    if (runeData.isTrap) {
      const { FakeRuneEffects } = await import('../runes/FakeRuneEffects.js');
      try {
        const context = this.getEffectContext(runeName);

        if (runeName === 'rune_pathblock' && !context) {
          console.warn("[InteractionManager] Maze context missing for rune_pathblock! Effect will not trigger properly.");
        }

        FakeRuneEffects[runeName]?.onEquip?.(this.player, gameState, this.hud, context);
      } catch (err) {
        console.warn("Error applying trap effect:", err);
      }
      return;
    }

    gameState.equippedRune = runeName;
  }

  useRune() {
    if (!gameState.equippedRune) {
      this.hud?.showMessage("No rune equipped!");
      return false;
    }

    const runeName = gameState.equippedRune;
    RuneEffects[runeName]?.activate?.(this.player, this.scene, this.hud, null);

    gameState.equippedRune = null;
    this.hud?.updateRuneDisplay(null);
    this.hud?.showMessage(`${runeName.replace("rune_", "")} rune used`);

    return true;
  }

  getEquippedRune() {
    return gameState.equippedRune;
  }

  update() {
    // Future enhancements: hover highlights, tooltips, etc.
  }

  getEffectContext(runeName) {
    switch (runeName) {
      case 'rune_pathblock':
        return this.maze;
      case 'rune_silence':
        return this.uiManager;
      case 'rune_void':
        return this.scene;
      default:
        return this.scene;
    }
  }
}
