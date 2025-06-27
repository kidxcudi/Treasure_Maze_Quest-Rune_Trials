// src/core/Collision.js
import * as THREE from 'three';

let wallColliders = [];

/**
 * Precomputes bounding boxes for all walls and stores them for reuse.
 * Call this once during maze build.
 */
export function initWallColliders(walls, scene = null, debug = false) {
  wallColliders = walls.map(wall => {
    const box = new THREE.Box3().setFromObject(wall);

    // if (debug && scene) {
    //   const helper = new THREE.Box3Helper(box, 0xff0000);
    //   scene.add(helper);
    // }

    return { mesh: wall, box };
  });
}

/**
 * Checks if the player's position collides with any wall bounding box.
 * @param {THREE.Vector3} playerPosition 
 * @param {number} buffer - size of the player's box
 * @returns {boolean}
 */
export function checkCollision(playerPosition, buffer = 0.4) {
  const playerBox = new THREE.Box3().setFromCenterAndSize(
    playerPosition.clone(),
    new THREE.Vector3(buffer, buffer, buffer)
  );

  for (const { box } of wallColliders) {
    if (box.intersectsBox(playerBox)) {
      return true;
    }
  }

  return false;
}

export { wallColliders };