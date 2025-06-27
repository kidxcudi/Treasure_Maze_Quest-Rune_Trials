import * as THREE from 'three';
import { maze1 } from '../maze/mazeLayout.js'; // <-- Adjust path if needed
import { wallColliders } from '../core/Collision.js';

const tileSize = maze1.tileSize;

export function spawnEasterEgg({ x, z, type }, scene, secretObjects) {
  const posX = x * tileSize;
  const posZ = z * tileSize;
  let createdMesh = null;

  switch (type) {
    case 'pass_through':
      const wall1 = new THREE.Mesh(
        new THREE.BoxGeometry(tileSize, tileSize * 2, tileSize),
        new THREE.MeshStandardMaterial({ color: 0x1c1f22, transparent: true, opacity: 0.986 })
      );
      wall1.position.set(posX, tileSize, posZ);
      wall1.userData.passThrough = true;
      wall1.userData.isTreasureHidden = true;
      scene.add(wall1);
      break;

    case 'breakable': {
      const wall2 = new THREE.Mesh(
        new THREE.BoxGeometry(tileSize, tileSize * 2, tileSize),
        new THREE.MeshStandardMaterial({ color: 0x773333 })
      );
      wall2.position.set(posX, tileSize, posZ);
      wall2.userData.breakable = true;
      wall2.userData.isObstacle = true;
      wall2.userData.isTreasureHidden = true;
      scene.add(wall2);
      secretObjects.push(wall2);
      createdMesh = wall2;
      break;
    }

    case 'low_wall': {
      const lowWall = new THREE.Mesh(
        new THREE.BoxGeometry(tileSize, tileSize * 0.5, tileSize),
        new THREE.MeshStandardMaterial({ color: 0x22272b })
      );
      lowWall.position.set(posX, tileSize * 0.25, posZ);
      lowWall.userData.isObstacle = true;
      scene.add(lowWall);
      secretObjects.push(lowWall);
      createdMesh = lowWall;
      break;
    }

    case 'quicksand': {
      const visual = new THREE.Mesh(
        new THREE.CylinderGeometry(tileSize * 0.4, tileSize * 0.5, 0.2, 32),
        new THREE.MeshStandardMaterial({
          color: 0x665533,
          transparent: true,
          opacity: 0.8,
          roughness: 1,
          metalness: 0,
          emissive: new THREE.Color(0x332200),
          emissiveIntensity: 0.1,
        })
      );
      visual.position.set(posX, 0, posZ);
      scene.add(visual);

      const trigger = new THREE.Mesh(
        new THREE.BoxGeometry(tileSize * 1, 2, tileSize * 1),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      trigger.position.set(posX, 1, posZ);
      trigger.userData.isQuicksand = true;
      scene.add(trigger);
      secretObjects.push(trigger);
      break;
    }
  }

  return createdMesh;
}

/**
 * Attempts to break a wall if conditions are met.
 * Shared by both proximity check and collision handlers.
 *
 * @param {THREE.Mesh} wall
 * @param {boolean} canBreak
 * @param {THREE.Scene} scene
 * @param {HUD} hud
 * @param {InteractionManager} interactionManager
 * @returns {boolean} true if broken
 */
/**
 * Attempts to break a wall if conditions are met.
 * Now includes complete cleanup of all references.
 */
function tryBreakWall(wall, canBreak, scene, hud, interactionManager, secretObjects) {
  if (!wall?.userData?.breakable) return false;

  if (canBreak) {    
    // 1. Remove from interaction system first
    if (interactionManager?.removeInteractable) {
      interactionManager.removeInteractable(wall);
    }

    // 2. Remove from physics/collision system
    const colliderIndex = wallColliders.findIndex(entry => entry.mesh === wall);
    if (colliderIndex !== -1) {
      wallColliders.splice(colliderIndex, 1);
    }

    // 3. Remove from secret objects array
    if (secretObjects) {
      const secretIndex = secretObjects.indexOf(wall);
      if (secretIndex !== -1) {
        secretObjects.splice(secretIndex, 1);
      }
    }

    // 4. Remove from scene
    if (wall.parent === scene) {
      scene.remove(wall);
    }

    // 5. Clean up resources
    if (wall.geometry) {
      wall.geometry.dispose();
    }
    
    if (wall.material) {
      if (Array.isArray(wall.material)) {
        wall.material.forEach(m => m.dispose());
      } else {
        wall.material.dispose();
      }
    }

    // 6. Nullify userData to prevent any residual interactions
    wall.userData = {};
    
    hud?.showMessage("💥 Wall shattered!");
    console.groupEnd();
    return true;
  } else {
    hud?.showMessage("🛑 You need the Strength rune to break this wall!");
    return false;
  }
}

/**
 * Called when player walks into a breakable wall.
 */
export function handleSecretCollision(object, player, scene, hud, interactionManager) {
  tryBreakWall(object, player.canBreakWalls, scene, hud, interactionManager);
}

/**
 * Checks if player is near a breakable wall to attempt breaking.
 *
 * @param {THREE.Vector3} playerPosition
 * @param {boolean} canBreakWalls
 * @param {Array<THREE.Mesh>} walls
 * @param {THREE.Scene} scene
 * @param {HUD} hud
 * @param {InteractionManager} interactionManager
 */
export function checkBreakableWallProximity(playerPosition, canBreakWalls, walls, scene, hud) {
  for (const wall of walls) {
    if (!wall.userData?.breakable) continue;

    const distance = playerPosition.distanceTo(wall.position);

    if (distance < 3.4) {
      tryBreakWall(wall, canBreakWalls, scene, hud);
      return;
    }
  }
}

