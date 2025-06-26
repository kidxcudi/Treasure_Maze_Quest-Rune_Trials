import * as THREE from 'three';

const tileSize = 3;

const mazeLayout = [
  '#############',
  '#...#.......#',
  '#.#.#.#####.#',
  '#S#.....#...#',
  '###.###.#.###',
  '#.....#.#...#',
  '#.#####.###.#',
  '#.....#.....#',
  '#.###.#####.#',
  '#...#.....E.#',
  '#############',
];

export function buildMaze(scene) {
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x1c1f22 });
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xd8cab8 });

  const wallGeometry = new THREE.BoxGeometry(tileSize, tileSize * 2, tileSize);
  const floorGeometry = new THREE.PlaneGeometry(tileSize, tileSize);

  const walls = [];
  const openTiles = []; // ⬅️ For storing walkable positions

  for (let z = 0; z < mazeLayout.length; z++) {
    for (let x = 0; x < mazeLayout[z].length; x++) {
      const char = mazeLayout[z][x];
      const worldX = x * tileSize;
      const worldZ = z * tileSize;

      // Floor tile
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(worldX, 0, worldZ);
      scene.add(floor);

      if (char === '#') {
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(worldX, tileSize, worldZ);
        wall.castShadow = true;
        wall.receiveShadow = true;
        wall.userData.isObstacle = true;
        scene.add(wall);
        walls.push(wall);
      } else {
        // Save open tile location
        const fakeWall = new THREE.Mesh(wallGeometry, wallMaterial);
        fakeWall.position.set(worldX, tileSize, worldZ);
        fakeWall.visible = false; // initially invisible
        scene.add(fakeWall);

        openTiles.push({
          x: worldX,
          z: worldZ,
          mesh: fakeWall,
        });
      }
    }
  }

  function getNearestOpenTile(playerPos) {
    let closest = null;
    let minDist = Infinity;

    for (const tile of openTiles) {
      const dx = tile.x - playerPos.x;
      const dz = tile.z - playerPos.z;
      const dist = dx * dx + dz * dz;

      if (dist < minDist) {
        minDist = dist;
        closest = tile;
      }
    }

    return closest;
  }

  function blockAllPaths(steps = 10) {
    openTiles.forEach(tile => {
      tile.mesh.visible = true; // Show fake wall
    });

    let counter = 0;
    const stepHandler = () => {
      counter++;
      if (counter >= steps) {
        openTiles.forEach(tile => {
          tile.mesh.visible = false; // Restore walkable state
        });
        window.removeEventListener('keydown', stepHandler);
      }
    };

    window.addEventListener('keydown', stepHandler);
  }

  return {
    walls,
    tileSize,
    mazeLayout,
    blockAllPaths,
  };
}
