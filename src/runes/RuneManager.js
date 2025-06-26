// src/runes/RuneManager.js

import * as THREE from 'three';
import { RuneTypes } from './RuneTypes.js';

export class RuneManager {
  constructor(scene) {
    this.scene = scene;
    this.runes = [];
    this.fakeChance = Math.random() * (0.35 - 0.25) + 0.25;  

    this.initRunes();
  }

  createRune(baseName, position) {
    const baseData = RuneTypes[baseName];
    if (!baseData) return;

    let assignedName = baseName;
    let isTrap = false;

    // Decide if this should secretly be a fake rune
    if (baseData.fakeVariant && Math.random() < this.fakeChance) {
      assignedName = baseData.fakeVariant;
      isTrap = true;
    }

    // Always use visual from the real rune (baseData)
    const material = new THREE.MeshStandardMaterial({
      color: baseData.color,
      emissive: baseData.color,
      emissiveIntensity: 1,
    });

    const rune = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 32, 32),
      material
    );

    rune.name = assignedName; // internally store actual behavior
    rune.userData = {
      label: baseData.label,
      isTrap,
      displayName: baseName
    };

    rune.position.copy(position);
    this.scene.add(rune);
    this.runes.push(rune);
  }


  initRunes() {
    this.createRune('rune_flight', new THREE.Vector3(8, 1, 8));
    this.createRune('rune_strength', new THREE.Vector3(12, 1, 10));
    this.createRune('rune_speed', new THREE.Vector3(11, 1, 10));
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

  isRuneTrap(runeName) {
    const data = RuneTypes[runeName];
    return !!data?.isTrap;
  }
}