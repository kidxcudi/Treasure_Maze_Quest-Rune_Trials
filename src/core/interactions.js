// src/core/interaction/InteractionManager.js
import { GameRaycaster } from './physics/Raycaster.js';
import { gameState } from './gameState.js';
import { RuneEffects } from '../entities/runes/effects/RuneEffects.js';
import { RuneTypes } from '../entities/runes/RuneTypes.js';
import { Tooltip } from '../ui/hud/Tooltip.js';
import { EventBus } from './utils/EventBus.js';

export class InteractionManager {
  constructor({
    camera,
    scene,
    runeManager,
    doorManager,
    trapManager,
    treasureManager,
    gameManager,
    uiManager,
    maze,
    player
  }) {
    this.dependencies = {
      camera,
      scene,
      runeManager,
      doorManager,
      trapManager,
      treasureManager,
      gameManager,
      uiManager,
      maze,
      player
    };

    this.raycaster = new GameRaycaster(camera, { range: 3, debug: true });
    this.tooltip = new Tooltip();
    this.interactables = [];
    this.hoveredObject = null;

    this.setupEventListeners();
    
    EventBus.on('input:use-rune', () => {
      if (!gameState.gameOver) {
        this.useRune();
      }
    });
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      if (gameState.gameOver) return;
      this.raycaster.updateFromEvent(e);
      this.handleInteraction();
    });

    // Optional hover detection
    document.addEventListener('mousemove', (e) => {
      this.raycaster.updateFromEvent(e);
      this.updateHoverState();
    });
  }


  handleInteraction() {
    const targets = {
      runes: this.dependencies.runeManager.getRunes(),
      doors: this.dependencies.doorManager?.getDoors() || [],
      // Add other target types...
    };

    const intersections = this.raycaster.getIntersections(targets);
    if (!intersections.length) return;

    // Process interactions in priority order
    const interactionHandled = 
      this.processRunePickup(intersections) ||
      this.processExitMechanism(intersections) ||
      this.processDoorInteraction(intersections);
      // this.processTrapTrigger(intersections) ||
      // this.processTreasurePickup(intersections) ||
      // this.processRuneTargets(intersections);

    if (!interactionHandled) {
      console.log('No valid interaction');
    }
  }

  processRunePickup(intersections) {
    const runeHit = intersections.find(h => h.object?.userData?.isRune);
    if (!runeHit) return false;

    this.pickupRune(runeHit.object);
    return true;
  }



  processExitMechanism(intersections) {
    const mech = this.dependencies.scene.getObjectByName("exit_mechanism");
    if (!mech || this.dependencies.gameManager?.isExitActivated?.()) return false;

    const mechHit = intersections.find(h => h.object === mech);
    if (!mechHit) return false;

    if (gameState.treasuresCollected >= gameState.totalTreasures) {
      this.dependencies.scene.remove(mech);
      this.dependencies.uiManager.showMessage("Exit activated! Hurry!");
      this.dependencies.gameManager.triggerExitTimer();
    } else {
      const missing = gameState.totalTreasures - gameState.treasuresCollected;
      this.dependencies.uiManager.showMessage(`Need ${missing} more treasure${missing > 1 ? 's' : ''}`);
    }
    return true;
  }

  processDoorInteraction(intersections) {
    const doorHit = intersections.find(h => h.objectType === 'door');
    if (!doorHit || !doorHit.object?.userData?.isDoor) return false;

    // Example door interaction logic:
    this.dependencies.doorManager.toggleDoor(doorHit.object);
    return true;
  }


  async pickupRune(runeObject) {
    if (gameState.equippedRune) {
      this.dependencies.uiManager.showMessage("Already equipped a rune!");
      return;
    }

    const rune = this.dependencies.runeManager.getRuneFromObject(runeObject);
    if (!rune) {
      console.warn("Invalid rune object");
      return;
    }

    const runeData = RuneTypes[rune.name];
    if (!runeData) {
      console.warn(`Unknown rune type: ${rune.name}`);
      return;
    }

    this.dependencies.runeManager.removeRune(rune);
    this.dependencies.uiManager.updateHUD({ rune: rune.name });
    this.dependencies.uiManager.showMessage(`Picked up ${runeData.label}`);
    this.dependencies.uiManager.showTooltip(runeData.description);

    if (runeData.isTrap) {
      await this.activateTrapRune(rune.name);
    } else {
      gameState.equippedRune = rune.name;
    }
  }

  async activateTrapRune(runeName) {
    try {
      const { FakeRuneEffects } = await import('../entities/runes/effects/FakeRuneEffects.js');
      const context = this.getEffectContext(runeName);
      FakeRuneEffects[runeName]?.onEquip?.(
        this.dependencies.player, 
        gameState, 
        this.dependencies.uiManager, 
        context
      );
    } catch (error) {
      console.error("Failed to activate trap rune:", error);
    }
  }

  useRune() {
  if (!gameState.equippedRune) {
    this.dependencies.uiManager.showMessage("No rune equipped!");
    return false;
  }

  const runeName = gameState.equippedRune;
  const runeKey = runeName.startsWith("rune_") ? runeName : `rune_${runeName}`;
  const runeData = RuneTypes[runeKey];
  const effectFn = RuneEffects[runeKey];

  if (typeof effectFn === 'function') {
    effectFn(
      this.dependencies.player,
      this.dependencies.scene,
      this.dependencies.uiManager
    );
    gameState.equippedRune = null;
    this.dependencies.uiManager.updateHUD(null);
    this.dependencies.uiManager.showMessage(`${runeData.label} rune used`);
    return true;
  } else {
    console.warn(`No effect function for rune: ${runeKey}`);
    return false;
  }
}


  removeInteractable(object) {
    if (!object || !this.interactables) {
      console.warn("Invalid object or interactables array");
      return false;
    }

    const index = this.interactables.findIndex(
      item => item === object || item.uuid === object.uuid
    );

    if (index !== -1) {
      this.interactables.splice(index, 1);

      if (typeof object.dispose === 'function') {
        object.dispose(); // ✅ CLEAN UP
      }

      if (object.parent === this.dependencies.scene) {
        this.dependencies.scene.remove(object);
      }

      return true;
    }

    return false;
  }


  updateHoverState() {
    // Implement hover highlighting logic here
  }

  update() {
    // Frame update logic
    if (this.hoveredObject) {
      // Handle hover effects
    }
  }

  getEffectContext(runeName) {
    const contextMap = {
      'rune_pathblock': this.dependencies.maze,
      'rune_silence': this.dependencies.uiManager,
      'rune_void': this.dependencies.scene
    };
    return contextMap[runeName] || this.dependencies.scene;
  }
}