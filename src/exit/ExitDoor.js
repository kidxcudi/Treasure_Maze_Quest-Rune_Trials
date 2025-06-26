// src/exit/ExitDoor.js
import * as THREE from 'three';

export class ExitDoor {
  constructor(scene, position) {
    this.scene = scene;
    this.locked = true;

    this.doorMesh = this.createDoorMesh();
    this.doorMesh.position.copy(position);

    // No rune required for unlocking currently
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
