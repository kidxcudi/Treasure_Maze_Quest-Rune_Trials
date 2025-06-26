import * as THREE from 'three';
import { RuneTypes } from './RuneTypes.js';
import { maze1 } from '../maze/mazeLayout.js'; // <-- Adjust path if needed

const tileSize = maze1.tileSize;

export class RuneManager {
  constructor(scene) {
    this.scene = scene;
    this.runes = [];
    this.fakeChance = Math.random() * (0.35 - 0.25) + 0.25;
  }

  createRune(baseName, position) {
    const baseData = RuneTypes[baseName];
    if (!baseData) return;

    let assignedName = baseName;
    let isTrap = false;

    // Randomly convert to fake rune
    if (baseData.fakeVariant && Math.random() < this.fakeChance) {
      assignedName = baseData.fakeVariant;
      isTrap = true;
    }

    const material = new THREE.MeshStandardMaterial({
      color: baseData.color,
      emissive: baseData.color,
      emissiveIntensity: 1,
    });

    const rune = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 32, 32),
      material
    );

    rune.name = assignedName;
    rune.userData = {
      label: baseData.label,
      isTrap,
      displayName: baseName,
    };

    rune.position.copy(position);
    this.scene.add(rune);
    this.runes.push(rune);
  }

  // ✅ Spawns all runes based on the maze map definition
  spawnFromMap(mazeMap) {
    mazeMap.objects.runes.forEach(({ x, z, type }) => {
      const worldX = x * tileSize + tileSize / 2.5;
      const worldZ = z * tileSize + tileSize / 2.5;
      const position = new THREE.Vector3(worldX, 0.5, worldZ);
      this.createRune(type, position);
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
