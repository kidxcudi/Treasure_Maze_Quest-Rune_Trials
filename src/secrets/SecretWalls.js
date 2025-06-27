import * as THREE from 'three';
import { maze1 } from '../maze/mazeLayout.js'; // <-- Adjust path if needed
import { wallColliders } from './Collision.js'; // if exported

const tileSize = maze1.tileSize;

export function spawnEasterEgg({ x, z, type }, scene, secretObjects) {
  const posX = x * tileSize;
  const posZ = z * tileSize;

  switch (type) {
    case 'pass_through':
      // Looks solid but no collision
      const wall1 = new THREE.Mesh(
        new THREE.BoxGeometry(tileSize, tileSize * 2, tileSize),
        new THREE.MeshStandardMaterial({ color: 0x1c1f22, transparent: true, opacity: 0.986 })
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
      wall2.userData.isObstacle = true;
      scene.add(wall2);
      secretObjects.push(wall2); // already used for interaction
      wallColliders.push({ mesh: wall2, box: new THREE.Box3().setFromObject(wall2) }); // ⬅ Add this line
      break;


    case 'low_wall': {
      const lowWall = new THREE.Mesh(
        new THREE.BoxGeometry(tileSize, tileSize * 0.5, tileSize),
        new THREE.MeshStandardMaterial({ color: 0x22272b })
      );
      lowWall.position.set(posX, tileSize * 0.25, posZ);
      lowWall.userData.jumpable = true;
      lowWall.userData.isObstacle = true;
      scene.add(lowWall);
      secretObjects.push(lowWall);

      // ⬇️ Add to wallColliders for collision detection
      wallColliders.push({ mesh: lowWall, box: new THREE.Box3().setFromObject(lowWall) });
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

      // Invisible interaction collider
      const trigger = new THREE.Mesh(
        new THREE.BoxGeometry(tileSize * 1, 2, tileSize * 1),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      trigger.position.set(posX, 1, posZ); // Y = 1 to match player height
      trigger.userData.isQuicksand = true;
      scene.add(trigger);
      secretObjects.push(trigger);
      break;
    }

  }
}

// SecretWalls.js
export function handleSecretCollision(object, player, scene, hud) {
  const { passThrough, breakable, jumpable, isTrap, isQuicksand } = object.userData;

  if (breakable) {
    if (player.canBreakWalls) {
      objectBreaks(object, scene);
    } else {
      blockPlayer();
    }
    return;
  }

  export function objectBreaks(object, scene) {
  if (!object) return;

  // Remove from scene
  scene.remove(object);

  // Also remove from wallColliders so it no longer blocks
  const index = wallColliders.findIndex(entry => entry.mesh === object);
  if (index !== -1) wallColliders.splice(index, 1);

  console.log("💥 Wall broken!");
}
}


