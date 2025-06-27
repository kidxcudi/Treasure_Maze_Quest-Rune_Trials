import * as THREE from 'three';
import { maze1 } from './mazeLayout.js';
import { spawnEasterEgg } from '../secrets/SecretWalls.js';

export const tileSize = maze1.tileSize;
const wallHeight = tileSize * 2;

export function buildMaze(scene, secretObjects = []) {
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x1c1f22 });
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xd8cab8 });

  const floorGeometry = new THREE.PlaneGeometry(tileSize, tileSize);
  const wallGeometry = new THREE.BoxGeometry(tileSize, wallHeight, tileSize);

  const walls = [];
  const openTiles = [];

  const rows = maze1.layout.length;
  const cols = maze1.layout[0].length;

  for (let z = 0; z < rows; z++) {
    for (let x = 0; x < cols; x++) {
      const char = maze1.layout[z][x];
      const worldX = x * tileSize;
      const worldZ = z * tileSize;

      // Floor
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(worldX, 0, worldZ);
      floor.receiveShadow = true;
      scene.add(floor);

      if (char === '#') {
        // Wall
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(worldX, wallHeight / 2, worldZ);
        wall.castShadow = true;
        wall.receiveShadow = true;
        wall.userData.isObstacle = true;
        scene.add(wall);
        walls.push(wall);
      } else {
        // Fake invisible blocker (for temporary path blocking)
        const fakeWall = new THREE.Mesh(
          new THREE.BoxGeometry(tileSize, wallHeight, tileSize),
          wallMaterial
        );
        fakeWall.position.set(worldX, wallHeight / 2, worldZ);
        fakeWall.visible = false;
        scene.add(fakeWall);
        openTiles.push({ x: worldX, z: worldZ, mesh: fakeWall });
      }
    }
  }

  maze1.objects.easterEggs.forEach(egg => {
    spawnEasterEgg(egg, scene, secretObjects);
  });


  function blockAllPaths(steps = 10) {
    openTiles.forEach(tile => tile.mesh.visible = true);

    let counter = 0;
    const stepHandler = () => {
      counter++;
      if (counter >= steps) {
        openTiles.forEach(tile => tile.mesh.visible = false);
        window.removeEventListener('keydown', stepHandler);
      }
    };

    window.addEventListener('keydown', stepHandler);
  }

  return {
    walls,
    openTiles,
    blockAllPaths,
    tileSize,
    layout: maze1.layout,
    objects: maze1.objects,
  };
}
