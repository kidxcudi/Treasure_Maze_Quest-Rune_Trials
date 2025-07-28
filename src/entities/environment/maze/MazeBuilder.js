import * as THREE from 'three';
import { maze1 } from './MazeLayout.js';
import { SecretWallSystem } from '../secrets/SecretWalls.js';

// Constants moved to config
const WALL_HEIGHT_MULTIPLIER = 2;
const WALL_COLOR = 0x1c1f22;
const FLOOR_COLOR = 0xd8cab8;

export class MazeBuilder {
  constructor(scene, secretObjects = []) {
    this.scene = scene;
    this.secretObjects = secretObjects;
    this.tileSize = maze1.tileSize;
    this.wallHeight = this.tileSize * WALL_HEIGHT_MULTIPLIER;
    
    // Reusable geometries
    this.floorGeometry = new THREE.PlaneGeometry(this.tileSize, this.tileSize);
    this.wallGeometry = new THREE.BoxGeometry(this.tileSize, this.wallHeight, this.tileSize);
    
    // Reusable materials
    this.wallMaterial = new THREE.MeshStandardMaterial({ color: WALL_COLOR });
    this.floorMaterial = new THREE.MeshStandardMaterial({ color: FLOOR_COLOR });
    
    this.walls = [];
    this.openTiles = [];
  }

  build() {
    this._buildTerrain();
    this._placeEasterEggs();
    
    return {
      walls: this.walls,
      openTiles: this.openTiles,
      blockAllPaths: this._createPathBlocker(),
      tileSize: this.tileSize,
      layout: maze1.layout,
      objects: maze1.objects
    };
  }

  _buildTerrain() {
    const rows = maze1.layout.length;
    const cols = maze1.layout[0].length;

    for (let z = 0; z < rows; z++) {
      for (let x = 0; x < cols; x++) {
        const char = maze1.layout[z][x];
        const worldX = x * this.tileSize;
        const worldZ = z * this.tileSize;

        this._createFloor(worldX, worldZ);
        char === '#' 
          ? this._createWall(worldX, worldZ) 
          : this._createFakeWall(worldX, worldZ);
      }
    }
  }

  _createFloor(x, z) {
    const floor = new THREE.Mesh(this.floorGeometry, this.floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(x, 0, z);
    floor.receiveShadow = true;
    this.scene.add(floor);
  }

  _createWall(x, z) {
    const wall = new THREE.Mesh(this.wallGeometry, this.wallMaterial);
    wall.position.set(x, this.wallHeight / 2, z);
    wall.castShadow = true;
    wall.receiveShadow = true;
    wall.userData.isObstacle = true;
    this.scene.add(wall);
    this.walls.push(wall);
  }

  _createFakeWall(x, z) {
    const fakeWall = new THREE.Mesh(this.wallGeometry, this.wallMaterial);
    fakeWall.position.set(x, this.wallHeight / 2, z);
    fakeWall.visible = false;
    fakeWall.userData.isObstacle = false;
    this.scene.add(fakeWall);
    this.openTiles.push({ x, z, mesh: fakeWall });
  }

  // MazeBuilder.js
  _placeEasterEggs() {
    const secretSystem = new SecretWallSystem(this.scene, this.interactionManager, this.hud); // You must inject these if needed

    maze1.objects.easterEggs.forEach(egg => {
      const mesh = secretSystem.spawnEasterEgg(egg);
      if (mesh) this.walls.push(mesh);
    });

    this.secretSystem = secretSystem; // if needed later
  }


  _createPathBlocker(steps = 10) {
    return () => {
      this.openTiles.forEach(tile => tile.mesh.visible = true);

      let counter = 0;
      const stepHandler = () => {
        if (++counter >= steps) {
          this.openTiles.forEach(tile => tile.mesh.visible = false);
          window.removeEventListener('keydown', stepHandler);
        }
      };

      window.addEventListener('keydown', stepHandler);
    };
  }
}