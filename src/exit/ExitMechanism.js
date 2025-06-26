import * as THREE from 'three';
import { maze1 } from '../maze/mazeLayout.js'; // <-- Adjust path if needed

const tileSize = maze1.tileSize;

export class ExitMechanism {
  constructor(scene, position, gameManager) {
    this.scene = scene;
    this.position = position;
    this.gameManager = gameManager;

    this.mesh = this.createMechanismMesh();
    this.scene.add(this.mesh);
  }

  createMechanismMesh() {
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffcc00,
      emissive: 0xffcc00,
      emissiveIntensity: 1,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(this.position);
    mesh.rotation.x = Math.PI / 2; // Rotate to face the player
    mesh.name = "exit_mechanism";

    return mesh;
  }

  getObject() {
    return this.mesh;
  }

  activate() {
    console.log("🚨 Exit mechanism activated");
    this.gameManager.triggerExitTimer();
    this.scene.remove(this.mesh);
  }
}

// Helper function to spawn the exit mechanism using maze1 data
export function spawnExitMechanism(scene, gameManager) {
  const { x, z } = maze1.objects.exitMechanism;
  const worldX = x * tileSize + tileSize / 2;
  const worldZ = z * tileSize + tileSize / 2;
  const position = new THREE.Vector3(
    worldX,
    0.5,  // Height adjustment
    worldZ
  );
  return new ExitMechanism(scene, position, gameManager);
}
