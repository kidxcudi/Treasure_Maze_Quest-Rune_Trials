// src/runes/RuneManager.js

import * as THREE from 'three';
import { RuneTypes } from './RuneTypes.js';
import { maze1 } from '../maze/MazeLayout.js';

const tileSize = maze1.tileSize;

export class RuneManager {
  constructor(scene) {
    this.scene = scene;
    this.runes = [];
    this.runePool = [];

    this.globalTime = { value: 0 };

    this.trapRuneKeys = Object.keys(RuneTypes).filter(
      key => RuneTypes[key].isTrap
    );
  }

  getRandomTrapRuneName() {
    const index = Math.floor(Math.random() * this.trapRuneKeys.length);
    return this.trapRuneKeys[index];
  }

  createRune(baseName, position, forceTrap = false) {
    let visualName = baseName;
    let effectName = baseName;
    let isTrap = false;

    if (forceTrap) {
      effectName = this.getRandomTrapRuneName();
      isTrap = true;
    }

    const visualData = RuneTypes[visualName];
    const effectData = RuneTypes[effectName];
    if (!visualData || !effectData) return;

    let orb = this.runePool.pop();
    if (!orb) {
      // --------- NEW RUNE CREATION ---------
      const orbMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0,
        metalness: 0,
        transmission: 1.0,
        thickness: 0.01,
        ior: 1.1,
        envMapIntensity: 1.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        iridescence: 1.0,
        iridescenceIOR: 1.3,
        transparent: true,
        side: THREE.FrontSide,
        depthWrite: false
      });

      orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 48, 48),
        orbMaterial
      );

      const outlineMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTime: this.globalTime,
          uColor: { value: new THREE.Color(visualData.color) }
        },
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          uniform float uTime;
          varying vec3 vNormal;
          void main() {
            float intensity = pow(abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 0.8);
            float pulse = 0.5 + 0.5 * sin(uTime * 2.0);
            gl_FragColor = vec4(uColor * intensity * pulse, 0.15);
          }
        `,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide
      });

      const outline = new THREE.Mesh(
        new THREE.SphereGeometry(0.205, 64, 64),
        outlineMaterial
      );
      orb.add(outline);

      const innerMaterial = new THREE.MeshStandardMaterial({
        color: visualData.color,
        emissive: visualData.color,
        emissiveIntensity: 1.0,
        roughness: 0.3,
        metalness: 0.5
      });

      const inner = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.05, 0),
        innerMaterial
      );
      orb.add(inner);

      orb.userData.innerMesh = inner;
      orb.userData.outlineMaterial = outlineMaterial;

      const glowLight = new THREE.PointLight(visualData.color, 0.5, 2);
      glowLight.position.set(position.x, position.y - 0.1, position.z);
      this.scene.add(glowLight);

      orb.userData.glowLight = glowLight;
    }

    // --------- UPDATE DATA ---------
    orb.visible = true;
    orb.name = effectName;
    orb.userData.label = visualData.label;
    orb.userData.isTrap = isTrap;
    orb.userData.displayName = visualName;
    orb.userData.offset = Math.random() * Math.PI * 2;

    orb.position.copy(position);
    this.scene.add(orb);
    this.runes.push(orb);
  }

  update(time) {
    const t = time / 1000;
    this.globalTime.value = t;

    for (const rune of this.runes) {
      const offsetT = t + (rune.userData.offset || 0);
      rune.position.y = 0.5 + Math.sin(offsetT * 2) * 0.05;
      rune.rotation.y += 0.01;

      const inner = rune.userData.innerMesh;
      if (inner?.material) {
        inner.material.emissiveIntensity = 0.5 + (Math.sin(offsetT * 2) * 0.5 + 0.5);
      }
    }
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
    if (rune.userData.glowLight) {
      this.scene.remove(rune.userData.glowLight);
    }
    rune.visible = false;
    this.scene.remove(rune);
    this.runes = this.runes.filter(r => r !== rune);
    this.runePool.push(rune); // 🔁 reuse it
  }

  isRuneTrap(runeName) {
    const data = RuneTypes[runeName];
    return !!data?.isTrap;
  }
}
