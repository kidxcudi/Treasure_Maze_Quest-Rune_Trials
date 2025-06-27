import * as THREE from 'three';
import { gameState } from '../core/gameState.js';
import { maze1 } from '../maze/mazeLayout.js'; // <-- Adjust path if needed

const tileSize = maze1.tileSize;

export class TreasureManager {
  constructor(scene, hud) {
    this.scene = scene;
    this.hud = hud;
    this.treasures = [];

    gameState.totalTreasures = 0;
    gameState.treasuresCollected = 0;
  }

  spawnFromMap(mazeMap) {
    const material = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffd700,
      emissiveIntensity: 0.6,
    });

    mazeMap.objects.treasures.forEach(({ x, z }) => {
      const rl = Math.random() < 0.5 ? -1 : 1;
      const lr = Math.random() < 0.5 ? -1 : 1;
      const worldX = x * tileSize + tileSize / (rl * 2.1);
      const worldZ = z * tileSize + tileSize / (lr * 2.1);
      const treasure = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.3, 0.3),
        material
      );
      treasure.name = 'treasure';
      treasure.position.set(worldX, 0.5, worldZ);
      treasure.castShadow = true;
      treasure.receiveShadow = true;
      treasure.userData.isTreasure = true;

      this.scene.add(treasure);
      this.treasures.push(treasure);
    });

    gameState.totalTreasures = this.treasures.length;
  }

  getTreasures() {
    return this.treasures;
  }

  collect(treasure) {
    this.scene.remove(treasure);
    this.treasures = this.treasures.filter(t => t !== treasure);

    gameState.treasuresCollected += 1;
    this.hud?.showMessage(
      `Treasure found! (${gameState.treasuresCollected}/${gameState.totalTreasures})`
    );

    if (gameState.treasuresCollected === gameState.totalTreasures) {
      this.hud?.showMessage("All treasures collected! Activate the exit!");
    }
  }
}
