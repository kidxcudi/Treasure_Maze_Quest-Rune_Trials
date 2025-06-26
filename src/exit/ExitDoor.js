// src/exit/ExitDoor.js
import * as THREE from 'three';
import { maze1 } from '../maze/mazeLayout.js'; // <-- Adjust path if needed

const tileSize = maze1.tileSize;

export class ExitDoor {
  constructor(scene, position) {
    this.scene = scene;
    this.locked = true;

    this.doorMesh = this.createDoorMesh();
    this.doorMesh.position.copy(position);

    // You could later use this if certain runes are required
    this.doorMesh.userData.requiredRune = null;

    this.scene.add(this.doorMesh);
  }

  createDoorMesh() {
    const geometry = new THREE.BoxGeometry(2, 4, 0.3);
    const material = new THREE.MeshStandardMaterial({ color: 0x4444ff });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = "exit_door";
    mesh.userData.isTreasure = true;
    return mesh;
  }

  getObject() {
    return this.doorMesh;
  }

  unlock() {
    this.locked = false;
    this.doorMesh.material.color.set(0x00ff88); // green
  }

  isUnlocked() {
    return !this.locked;
  }
}

// ✅ Helper function to spawn the door from maze1
export function spawnExitDoor(scene) {
  const { x, z } = maze1.objects.exit;
  const rl = Math.random() < 0.5 ? -1 : 1;
  const lr = Math.random() < 0.5 ? -1 : 1;
  const worldX = x * tileSize + tileSize / (rl * 2);
  const worldZ = z * tileSize + tileSize / (lr * 2);
  const position = new THREE.Vector3(
    worldX,
    1,
    worldZ
  );
  return new ExitDoor(scene, position);
}
