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
        scene.add(wall);
        walls.push(wall);
      }
    }
  }

  return {
    walls,
    tileSize,
    mazeLayout,
  };
}
