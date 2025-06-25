import * as THREE from 'three';

export function checkCollision(playerPosition, walls, buffer = 0.4) {
  const playerBox = new THREE.Box3().setFromCenterAndSize(
    playerPosition.clone(),
    new THREE.Vector3(buffer, buffer, buffer)
  );

  for (const wall of walls) {
    const wallBox = new THREE.Box3().setFromObject(wall);
    if (wallBox.intersectsBox(playerBox)) {
      return true;
    }
  }

  return false;
}
