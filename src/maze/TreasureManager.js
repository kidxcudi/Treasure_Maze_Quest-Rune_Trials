import * as THREE from 'three';
import { gameState } from '../core/gameState.js';
import { maze1 } from '../maze/MazeLayout.js'; // <-- Adjust path if needed

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

    const shell = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0,
      metalness: 0,
      transmission: 1.0,         // for glass effect
      thickness: 0.01,
      ior: 1.1,                  // bubble-like refractive index
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      iridescence: 1.0,
      iridescenceIOR: 1.3,
      transparent: true,
      side: THREE.FrontSide,
      depthWrite: false
    });

    // const material = new THREE.MeshStandardMaterial({
    //   color: 0xffd700,
    //   emissive: 0xffd700,
    //   emissiveIntensity: 0.6,
    // });

    mazeMap.objects.treasures.forEach(({ x, z }) => {
      const rl = Math.random() < 0.5 ? -1 : 1;
      const lr = Math.random() < 0.5 ? -1 : 1;
      const worldX = x * tileSize + tileSize / (rl * 2.4);
      const worldZ = z * tileSize + tileSize / (lr * 2.4);
      const treasure = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.3, 0.3),
        shell
      );
      treasure.name = 'treasure';
      treasure.position.set(worldX, 0.5, worldZ);
      treasure.castShadow = true;
      treasure.receiveShadow = true;
      treasure.userData.isTreasure = true;

      const innerMaterial = new THREE.MeshStandardMaterial({
              color: 0xffd700,
              emissive: 0xffd700,
              emissiveIntensity: 1.0,
              roughness: 0.3,
              metalness: 0.5
            });
      
      const inner = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.05, 0),
        innerMaterial
      );
      inner.position.set(0, 0, 0);
      treasure.add(inner);

      // === 4. Glow light ===
      const glowLight = new THREE.PointLight(0xffd700, 0.5, 2);
      glowLight.position.set(worldX, 0.9, worldZ);
      this.scene.add(glowLight);

      treasure.userData.glowLight = glowLight;

      this.scene.add(treasure);
      this.treasures.push(treasure);
    });

    gameState.totalTreasures = this.treasures.length;
  }

  getTreasures() {
    return this.treasures;
  }

  collect(treasure) {
    if (treasure.userData.glowLight) {
      this.scene.remove(treasure.userData.glowLight);
    }
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
