// src/runes/RuneManager.js

import * as THREE from 'three';
import { RuneTypes } from './RuneTypes.js';
import { maze1 } from '../maze/mazeLayout.js';

const tileSize = maze1.tileSize;

export class RuneManager {
  constructor(scene) {
    this.scene = scene;
    this.runes = [];

    // Collect all trap-only rune types
    this.trapRuneKeys = Object.keys(RuneTypes).filter(key => RuneTypes[key].isTrap);
  }

  getRandomTrapRuneName() {
    const randomIndex = Math.floor(Math.random() * this.trapRuneKeys.length);
    return this.trapRuneKeys[randomIndex];
  }

  createRune(baseName, position, forceTrap = false) {
    let visualName = baseName;                   // what it looks like
    let effectName = baseName;                   // what it actually does
    let isTrap = false;

    if (forceTrap) {
      effectName = this.getRandomTrapRuneName(); // pick a random trap effect
      isTrap = true;
    }

    const visualData = RuneTypes[visualName];
    const effectData = RuneTypes[effectName];

    if (!visualData || !effectData) return;

    const material = new THREE.MeshStandardMaterial({
      color: visualData.color,
      emissive: visualData.color,
      emissiveIntensity: 1,
    });

    const rune = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 32, 32),
      material
    );

    rune.name = effectName; // used for effect logic
    rune.userData = {
      label: visualData.label,         // what it looks like to the player
      isTrap,
      displayName: visualName,         // true origin (for tooltip or debugging)
    };

    rune.position.copy(position);
    this.scene.add(rune);
    this.runes.push(rune);
  }

  spawnFromMap(mazeMap) {
    mazeMap.objects.runes.forEach(({ x, z, type, isTrap }) => {
      const rl = Math.random() < 0.5 ? -1 : 1;
      const lr = Math.random() < 0.5 ? -1 : 1;
      const worldX = x * tileSize + tileSize / (rl * 2.5);
      const worldZ = z * tileSize + tileSize / (lr * 2.5);
      const position = new THREE.Vector3(worldX, 0.5, worldZ);

      this.createRune(type, position, isTrap);
    });
  }

  getRunes() {
    return this.runes;
  }

  removeRune(rune) {
    this.scene.remove(rune);
    this.runes = this.runes.filter(r => r !== rune);
  }

  isRuneTrap(runeName) {
    const data = RuneTypes[runeName];
    return !!data?.isTrap;
  }
}
