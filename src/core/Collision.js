// src/core/Collision.js
import * as THREE from 'three';

let wallColliders = [];

/**
 * Precomputes bounding boxes for all walls and stores them for reuse.
 * Call this once during maze build.
 * @param {THREE.Mesh[]} walls - Array of wall meshes
 * @param {THREE.Scene} [scene=null] - Scene for debug helpers
 * @param {boolean} [debug=false] - Whether to show bounding box helpers
 */
export function initWallColliders(walls, scene = null, debug = false) {
  wallColliders = walls.map(wall => {
    wall.updateMatrixWorld(true); // Ensure world matrix is updated
    const box = new THREE.Box3().setFromObject(wall);

    if (debug && scene) {
      const helper = new THREE.Box3Helper(box, 0xff0000);
      scene.add(helper);
    }

    return { mesh: wall, box };
  });
}

/**
 * Add a new wall collider dynamically (e.g., breakable or low wall)
 * @param {THREE.Mesh} mesh 
 * @param {THREE.Scene} [scene=null] - Scene for debug helper
 * @param {boolean} [debug=false] - Whether to show bounding box helper
 */
export function addWallCollider(mesh, scene = null, debug = false) {
  mesh.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(mesh);
  wallColliders.push({ mesh, box });

  if (debug && scene) {
    const helper = new THREE.Box3Helper(box, 0xff0000);
    scene.add(helper);
  }
}

/**
 * Checks if the player's position collides with any wall bounding box.
 * @param {THREE.Vector3} playerPosition 
 * @param {number} [buffer=0.4] - size of the player's collision box
 * @param {object} [player=null] - player reference for special flags (like jumping)
 * @returns {boolean}
 */
export function checkCollision(playerPosition, buffer = 0.4, player = null) {
  const playerBox = new THREE.Box3().setFromCenterAndSize(
    playerPosition.clone(),
    new THREE.Vector3(buffer, buffer, buffer)
  );

  for (const { box, mesh } of wallColliders) {
    // Skip low walls if player can jump over walls
    if (mesh.userData?.jumpable && player?.canJumpOverWalls) continue;

    if (box.intersectsBox(playerBox)) {
      return true;
    }
  }

  return false;
}

export { wallColliders };
