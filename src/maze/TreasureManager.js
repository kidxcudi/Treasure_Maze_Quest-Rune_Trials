import * as THREE from 'three';
import { gameState } from '../core/gameState.js';

export class TreasureManager {
  constructor(scene, hud) {
    this.scene = scene;
    this.hud = hud;
    this.treasures = [];

    // Track how many are needed
    gameState.totalTreasures = 4;
    gameState.treasuresCollected = 0;

    this.spawnTreasures();
  }

  spawnTreasures() {
    const positions = [
      new THREE.Vector3(10, 1, 5),
      new THREE.Vector3(8, 1, 10),
      new THREE.Vector3(4, 1, 5),
    ];

    const material = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffd700,
      emissiveIntensity: 0.6,
    });

    for (let pos of positions) {
      const treasure = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.5),
        material
      );
      treasure.name = 'treasure';
      treasure.position.copy(pos);
      treasure.castShadow = true;
      treasure.receiveShadow = true;
      treasure.userData.isTreasure = true;

      this.scene.add(treasure);
      this.treasures.push(treasure);
    }
  }

  getTreasures() {
    return this.treasures;
  }

  collect(treasure) {
    this.scene.remove(treasure);
    this.treasures = this.treasures.filter(t => t !== treasure);

    gameState.treasuresCollected += 1;
    this.hud?.showMessage(`Treasure found! (${gameState.treasuresCollected}/${gameState.totalTreasures})`);

    if (gameState.treasuresCollected === gameState.totalTreasures) {
      this.hud?.showMessage("All treasures collected! Activate the exit!");
    }
  }
}
