import * as THREE from 'three';
import { RuneTypes } from './RuneTypes.js';
import { maze1 } from '../environment/maze/MazeLayout';

const tileSize = maze1.tileSize;
// Constants
const RUNE_CONFIG = {
  VISUAL: {
    SIZE: 0.2,
    SEGMENTS: 48,
    INNER_SIZE: 0.05,
    HOVER_AMPLITUDE: 0.05,
    HOVER_SPEED: 2,
    ROTATION_SPEED: 0.01,
    GLOW_INTENSITY: 0.5,
    GLOW_DISTANCE: 2
  },
  MATERIALS: {
    ORB: {
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
      iridescenceIOR: 1.3
    },
    INNER: {
      emissiveIntensity: 1.0,
      roughness: 0.3,
      metalness: 0.5
    }
  },
  POSITION: {
    Y_OFFSET: 0.5,
    RANDOM_OFFSET: 2.5
  }
};

export class RuneManager {
  constructor(scene) {
    this.scene = scene;
    this.runes = [];
    this.runePool = [];
    this.globalTime = { value: 0 };
    this.trapRuneKeys = this._initializeTrapRunes();
    this._createSharedGeometries();
  }

  _initializeTrapRunes() {
    return Object.keys(RuneTypes).filter(key => RuneTypes[key].isTrap);
  }

  _createSharedGeometries() {
    this.orbGeometry = new THREE.SphereGeometry(
      RUNE_CONFIG.VISUAL.SIZE, 
      RUNE_CONFIG.VISUAL.SEGMENTS, 
      RUNE_CONFIG.VISUAL.SEGMENTS
    );
    this.outlineGeometry = new THREE.SphereGeometry(
      RUNE_CONFIG.VISUAL.SIZE * 1.025, 
      RUNE_CONFIG.VISUAL.SEGMENTS + 16, 
      RUNE_CONFIG.VISUAL.SEGMENTS + 16
    );
    this.innerGeometry = new THREE.IcosahedronGeometry(
      RUNE_CONFIG.VISUAL.INNER_SIZE, 
      0
    );
  }

  getRandomTrapRuneName() {
    return this.trapRuneKeys[
      Math.floor(Math.random() * this.trapRuneKeys.length)
    ];
  }

  createRune(baseName, position, forceTrap = false) {
    const { visualName, effectName, isTrap } = 
      this._determineRuneType(baseName, forceTrap);
    
    const visualData = RuneTypes[visualName];
    const effectData = RuneTypes[effectName];
    if (!visualData || !effectData){

      return null;
    } 

    const orb = this._getOrCreateRuneMesh(visualData, position);
    this._configureRuneData(orb, visualName, effectName, isTrap, position);
    
    orb.userData.isRune = true;
    orb.userData.runeType = effectName;
    this.scene.add(orb);
    this.runes.push(orb);
    return orb;
  }

  _determineRuneType(baseName, forceTrap) {
    return {
      visualName: baseName,
      effectName: forceTrap ? this.getRandomTrapRuneName() : baseName,
      isTrap: forceTrap
    };
  }

  _getOrCreateRuneMesh(visualData, position) {
    let orb = this.runePool.pop();
    if (!orb) {
      orb = this._createNewRuneMesh(visualData, position);
    }
    return orb;
  }

  _createNewRuneMesh(visualData, position) {
    const orbMaterial = new THREE.MeshPhysicalMaterial({
      ...RUNE_CONFIG.MATERIALS.ORB,
      transparent: true,
      side: THREE.FrontSide,
      depthWrite: false
    });

    const orb = new THREE.Mesh(this.orbGeometry, orbMaterial);

    const outlineMaterial = this._createOutlineMaterial(visualData.color);
    const outline = new THREE.Mesh(this.outlineGeometry, outlineMaterial);
    orb.add(outline);

    const innerMaterial = new THREE.MeshStandardMaterial({
      color: visualData.color,
      emissive: visualData.color,
      ...RUNE_CONFIG.MATERIALS.INNER
    });

    const inner = new THREE.Mesh(this.innerGeometry, innerMaterial);
    orb.add(inner);

    this._addGlowLight(orb, visualData.color, position);

    orb.userData = {
      innerMesh: inner,
      outlineMaterial,
      offset: Math.random() * Math.PI * 2
    };

    return orb;
  }

  _createOutlineMaterial(color) {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: this.globalTime,
        uColor: { value: new THREE.Color(color) }
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
  }

  _addGlowLight(orb, color, position) {
    const glowLight = new THREE.PointLight(
      color,
      RUNE_CONFIG.VISUAL.GLOW_INTENSITY,
      RUNE_CONFIG.VISUAL.GLOW_DISTANCE
    );
    glowLight.position.set(0, -0.1, 0);
    orb.userData.glowLight = glowLight;
    orb.add(glowLight);
  }

  _configureRuneData(orb, visualName, effectName, isTrap, position) {
    orb.visible = true;
    orb.name = effectName;
    orb.position.copy(position);
    
    Object.assign(orb.userData = {
      ...orb.userData,
      objectType: 'rune',
      label: RuneTypes[visualName].label,
      isTrap,
      isRune: true,               // ✅ Ensure interaction checks pass
      runeType: effectName,       
      displayName: visualName
    });
  }

  update(time) {
    const t = time / 1000;
    this.globalTime.value = t;

    for (const rune of this.runes) {
      if (!rune.userData) continue;
      
      const offsetT = t + rune.userData.offset;
      this._updateRunePosition(rune, offsetT);
      this._updateRuneRotation(rune);
      this._updateRuneEmissive(rune, offsetT);
      
    }

  }

  _updateRunePosition(rune, time) {
    rune.position.y = RUNE_CONFIG.POSITION.Y_OFFSET + 
      Math.sin(time * RUNE_CONFIG.VISUAL.HOVER_SPEED) * 
      RUNE_CONFIG.VISUAL.HOVER_AMPLITUDE;
  }

  _updateRuneRotation(rune) {
    rune.rotation.y += RUNE_CONFIG.VISUAL.ROTATION_SPEED;
  }

  _updateRuneEmissive(rune, time) {
    const inner = rune.userData.innerMesh;
    if (inner?.material) {
      inner.material.emissiveIntensity = 0.5 + 
        (Math.sin(time * RUNE_CONFIG.VISUAL.HOVER_SPEED) * 0.5 + 0.5);
    }
  }

  spawnFromMap(mazeMap) {
    mazeMap.objects.runes.forEach(({ x, z, type, isTrap }) => {
      const position = this._calculateRunePosition(x, z);
      this.createRune(type, position, isTrap);
    });
  }

  _calculateRunePosition(x, z) {
    const offsetDirection = Math.random() < 0.5 ? -1 : 1;
    const offset = tileSize / (offsetDirection * RUNE_CONFIG.POSITION.RANDOM_OFFSET);
    
    return new THREE.Vector3(
      x * tileSize + offset,
      RUNE_CONFIG.POSITION.Y_OFFSET,
      z * tileSize + offset
    );
  }

  getRunes() {
    return this.runes;
  }

  getRuneFromObject(object) {
    return this.runes.find(rune => rune === object || rune.uuid === object.uuid) || null;
  }


  removeRune(rune) {
    if (!rune) return;

    rune.visible = false;
    this.scene.remove(rune);
    this.runes = this.runes.filter(r => r !== rune);
    this.runePool.push(rune);
  }

  isRuneTrap(runeName) {
    return !!RuneTypes[runeName]?.isTrap;
  }

  dispose() {
    this.orbGeometry.dispose();
    this.outlineGeometry.dispose();
    this.innerGeometry.dispose();

    this.runes.forEach(rune => {
      if (rune.material) rune.material.dispose();
      if (rune.userData?.outlineMaterial) rune.userData.outlineMaterial.dispose();
      if (rune.userData?.innerMesh?.material) {
        rune.userData.innerMesh.material.dispose();
      }
    });

    this.runePool.forEach(rune => {
      if (rune.material) rune.material.dispose();
      if (rune.userData?.outlineMaterial) rune.userData.outlineMaterial.dispose();
      if (rune.userData?.innerMesh?.material) {
        rune.userData.innerMesh.material.dispose();
      }
    });
  }
}