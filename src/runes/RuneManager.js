import * as THREE from 'three';

export class RuneManager {
  constructor(scene) {
    this.scene = scene;
    this.runes = [];

    this.runeMaterial = new THREE.MeshStandardMaterial({
      color: 0x8a2be2, // lavender glow
      emissive: 0x8a2be2,
      emissiveIntensity: 1,
    });

    this.initRunes();
  }

  initRunes() {
    // Create one rune for now
    const rune = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 32, 32),
      this.runeMaterial
    );
    rune.position.set(8, 1, 8);
    rune.name = 'rune_flight';

    this.scene.add(rune);
    this.runes.push(rune);
  }

  getRunes() {
    return this.runes;
  }

  removeRune(rune) {
    this.scene.remove(rune);
    this.runes = this.runes.filter(r => r !== rune);
  }
}
