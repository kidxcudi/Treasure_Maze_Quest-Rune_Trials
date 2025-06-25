import * as THREE from 'three';
import { RuneTypes } from './RuneTypes.js';

export class RuneManager {
  constructor(scene) {
    this.scene = scene;
    this.runes = [];

    this.initRunes();
  }

  createRune(name, position) {
    const runeData = RuneTypes[name];
    const color = runeData?.color || 0x8a2be2;

    const material = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 1,
    });

    const rune = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 32, 32),
      material
    );

    rune.name = name;
    rune.position.copy(position);
    this.scene.add(rune);
    this.runes.push(rune);
  }

  initRunes() {
    this.createRune('rune_flight', new THREE.Vector3(8, 1, 8));
    this.createRune('rune_strength', new THREE.Vector3(12, 1, 10));
    this.createRune('rune_speed', new THREE.Vector3(6, 1, 14));
    this.createRune('rune_vision', new THREE.Vector3(4, 1, 4));
    this.createRune('rune_blink', new THREE.Vector3(10, 1, 6));
  }

  getRunes() {
    return this.runes;
  }

  removeRune(rune) {
    this.scene.remove(rune);
    this.runes = this.runes.filter(r => r !== rune);
  }
}
