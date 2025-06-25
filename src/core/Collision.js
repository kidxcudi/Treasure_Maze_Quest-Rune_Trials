import * as THREE from 'three';

export function checkCollision(playerPos, walls, threshold = 1.1) {
  for (const wall of walls) {
    const dist = wall.position.distanceTo(playerPos);
    if (dist < threshold) return true;
  }
  return false;
}
