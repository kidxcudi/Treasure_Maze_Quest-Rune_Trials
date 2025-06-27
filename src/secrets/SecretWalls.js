import * as THREE from 'three';
import { maze1 } from '../maze/mazeLayout.js'; // <-- Adjust path if needed

const tileSize = maze1.tileSize;

export function spawnEasterEgg({ x, z, type }, scene) {
  const posX = x * tileSize;
  const posZ = z * tileSize;

  switch (type) {
    case 'pass_through':
      // Looks solid but no collision
      const wall1 = new THREE.Mesh(
        new THREE.BoxGeometry(tileSize, tileSize * 2, tileSize),
        new THREE.MeshStandardMaterial({ color: 0x444444, transparent: true, opacity: 0.7 })
      );
      wall1.position.set(posX, tileSize, posZ);
      wall1.userData.passThrough = true;
      scene.add(wall1);
      break;

    case 'breakable':
      const wall2 = new THREE.Mesh(
        new THREE.BoxGeometry(tileSize, tileSize * 2, tileSize),
        new THREE.MeshStandardMaterial({ color: 0x773333 })
      );
      wall2.position.set(posX, tileSize, posZ);
      wall2.userData.breakable = true;
      scene.add(wall2);
      break;

    case 'low_wall':
      const lowWall = new THREE.Mesh(
        new THREE.BoxGeometry(tileSize, tileSize * 0.5, tileSize),
        new THREE.MeshStandardMaterial({ color: 0x555577 })
      );
      lowWall.position.set(posX, tileSize * 0.25, posZ);
      lowWall.userData.jumpable = true;
      scene.add(lowWall);
      break;

    case 'hole':
      const hole = new THREE.Mesh(
        new THREE.CylinderGeometry(tileSize * 0.4, tileSize * 0.5, 0.1, 32),
        new THREE.MeshStandardMaterial({ color: 0x000000 })
      );
      hole.position.set(posX, 0.01, posZ);
      hole.userData.isTrap = true;
      scene.add(hole);
      break;
  }
}

// SecretWalls.js
export function handleSecretCollision(object, player, scene) {
  const { passThrough, breakable, jumpable, isTrap } = object.userData;

  if (breakable) {
    if (player.hasRune('strength')) {
      objectBreaks(object, scene);
    } else {
      blockPlayer();
    }
    return;
  }

//   if (jumpable && !player.isJumping) {
//     blockPlayer();
//     return;
//   }

  if (isTrap) {
    triggerTrapEffect('hole', player);
  }
}

