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
    this.interactionRange = 5; // Units

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(0, 0);
    this.tooltip = new Tooltip();

    // Track mouse position
    document.addEventListener('mousemove', (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // Handle clicks
    document.addEventListener('click', (e) => {
      if (gameState.gameOver) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      this.handleClick();
    });
  }

  handleClick() {
    if (!this.camera || !this.scene) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const allTargets = [
      ...this.runeManager.getRunes(),
      ...(this.doorManager?.getDoors?.() || []),
      ...(this.trapManager?.getTraps?.() || []),
      ...(this.treasureManager?.getTreasures?.() || []),
      ...(this.interactables || []),
    ];

    const mech = this.scene.getObjectByName("exit_mechanism");
    if (mech) allTargets.push(mech);

    const hits = this.raycaster.intersectObjects(allTargets, true);
    if (hits.length === 0) return;

    const nearestHit = hits[0].object;
    if (!this.isWithinRange(nearestHit)) {
      this.hud?.showMessage("Too far to interact.");
      return;
    }

    // 🎯 Rune
    if (this.runeManager.getRunes().includes(nearestHit)) {
      this.pickupRune(nearestHit).catch(console.error);
      return;
    }

    // 🎯 Exit mechanism
    if (mech && nearestHit === mech && !this.gameManager?.isExitActivated?.()) {
      if (gameState.treasuresCollected >= gameState.totalTreasures) {
        this.scene.remove(mech);
        this.hud?.showMessage("Exit activated! Hurry!");
        this.gameManager?.triggerExitTimer?.();
      } else {
        const missing = gameState.totalTreasures - gameState.treasuresCollected;
        this.hud?.showMessage(`You still need ${missing} treasure${missing > 1 ? 's' : ''}...`);
      }
      return;
    }

    // 🎯 Door
    if (this.doorManager && this.doorManager.getDoors().includes(nearestHit)) {
      this.doorManager.tryOpenDoor(nearestHit);
      return;
    }

    // 🎯 Trap
    if (this.trapManager && this.trapManager.getTraps().includes(nearestHit)) {
      this.trapManager.triggerTrap(nearestHit);
      return;
    }

    // 🎯 Treasure
    if (this.treasureManager && this.treasureManager.getTreasures().includes(nearestHit)) {
      this.treasureManager.collect(nearestHit);
      return;
    }

    // 🎯 Interactable targets
    for (let obj of this.interactables) {
      if (nearestHit === obj && gameState.equippedRune) {
        if (obj.userData.requiredRune === gameState.equippedRune) {
          this.useRune();
          this.scene.remove(obj);
        } else {
          this.hud?.showMessage("Wrong rune!");
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

  isWithinRange(object) {
    if (!this.player?.controls?.object || !object?.position) return false;

    const playerPos = this.player.controls.object.position;

    // Walk up the parent chain to find a positioned mesh
    let target = object;
    while (target && !target.position && target.parent) {
      target = target.parent;
    }

    return target?.position && playerPos.distanceTo(target.position) <= this.interactionRange;
  }
}
