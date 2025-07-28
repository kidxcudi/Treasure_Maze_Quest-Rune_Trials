import * as THREE from 'three';
import { gameState } from '../../core/gameState.js';
import { maze1 } from '../environment/maze/MazeLayout';

const tileSize = maze1.tileSize;

// Constants
const TREASURE_CONFIG = {
  SIZE: 0.3,
  GLOW_LIGHT: {
    color: 0xffd700,
    intensity: 0.5,
    distance: 2,
    height: 0.9
  },
  SHELL_MATERIAL: {
    color: 0xffffff,
    roughness: 0,
    metalness: 0,
    transmission: 1.0,
    thickness: 0.01,
    ior: 1.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    iridescence: 1.0,
    iridescenceIOR: 1.3
  },
  CORE_MATERIAL: {
    color: 0xffd700,
    emissive: 0xffd700,
    emissiveIntensity: 1.0,
    roughness: 0.3,
    metalness: 0.5
  },
  POSITION_OFFSET: 2.4
};

export class TreasureManager {
  constructor(scene, hud) {
    this.scene = scene;
    this.hud = hud;
    this.treasures = [];
    this.coreGeometry = new THREE.IcosahedronGeometry(0.05, 0);
    this._initializeGameState();
    this._createMaterials();
  }

  _initializeGameState() {
    gameState.totalTreasures = 0;
    gameState.treasuresCollected = 0;
  }

  _createMaterials() {
    // Shell material (glass-like)
    this.shellMaterial = new THREE.MeshPhysicalMaterial({
      color: TREASURE_CONFIG.SHELL_MATERIAL.color,
      roughness: TREASURE_CONFIG.SHELL_MATERIAL.roughness,
      metalness: TREASURE_CONFIG.SHELL_MATERIAL.metalness,
      transmission: TREASURE_CONFIG.SHELL_MATERIAL.transmission,
      thickness: TREASURE_CONFIG.SHELL_MATERIAL.thickness,
      ior: TREASURE_CONFIG.SHELL_MATERIAL.ior,
      clearcoat: TREASURE_CONFIG.SHELL_MATERIAL.clearcoat,
      clearcoatRoughness: TREASURE_CONFIG.SHELL_MATERIAL.clearcoatRoughness,
      iridescence: TREASURE_CONFIG.SHELL_MATERIAL.iridescence,
      iridescenceIOR: TREASURE_CONFIG.SHELL_MATERIAL.iridescenceIOR,
      transparent: true,
      side: THREE.FrontSide,
      depthWrite: false
    });

    // Core material (glowing center)
    this.coreMaterial = new THREE.MeshStandardMaterial({
      color: TREASURE_CONFIG.CORE_MATERIAL.color,
      emissive: TREASURE_CONFIG.CORE_MATERIAL.emissive,
      emissiveIntensity: TREASURE_CONFIG.CORE_MATERIAL.emissiveIntensity,
      roughness: TREASURE_CONFIG.CORE_MATERIAL.roughness,
      metalness: TREASURE_CONFIG.CORE_MATERIAL.metalness
    });
  }

  spawnFromMap(mazeMap) {
    if (!mazeMap?.objects?.treasures) {
      console.warn('No treasures found in maze map');
      return;
    }

    mazeMap.objects.treasures.forEach(({ x, z }) => {
      const { position, treasure } = this._createTreasure(x, z);
      this._addGlowLight(position, treasure);
      this._addToScene(treasure);
    });

    gameState.totalTreasures = this.treasures.length;
  }

  _createTreasure(x, z) {
    const position = this._calculatePosition(x, z);
    const treasure = this._buildTreasureMesh(position);
    return { position, treasure };
  }

  _calculatePosition(x, z) {
    const rl = Math.random() < 0.5 ? -1 : 1;
    const lr = Math.random() < 0.5 ? -1 : 1;
    return {
      x: x * tileSize + tileSize / (rl * TREASURE_CONFIG.POSITION_OFFSET),
      z: z * tileSize + tileSize / (lr * TREASURE_CONFIG.POSITION_OFFSET)
    };
  }

  _buildTreasureMesh(position) {
    const treasure = new THREE.Mesh(
      new THREE.BoxGeometry(
        TREASURE_CONFIG.SIZE, 
        TREASURE_CONFIG.SIZE, 
        TREASURE_CONFIG.SIZE
      ),
      this.shellMaterial
    );

    treasure.name = 'treasure';
    treasure.position.set(position.x, 0.5, position.z);
    treasure.castShadow = true;
    treasure.receiveShadow = true;
    treasure.userData.isTreasure = true;

    const core = new THREE.Mesh(
      this.coreGeometry,
      this.coreMaterial
    );
    treasure.add(core);

    return treasure;
  }

  _addGlowLight(position, treasure) {
    const glowLight = new THREE.PointLight(
      TREASURE_CONFIG.GLOW_LIGHT.color,
      TREASURE_CONFIG.GLOW_LIGHT.intensity,
      TREASURE_CONFIG.GLOW_LIGHT.distance
    );
    glowLight.position.set(
      position.x,
      TREASURE_CONFIG.GLOW_LIGHT.height,
      position.z
    );
    this.scene.add(glowLight);
    treasure.userData.glowLight = glowLight;
    return glowLight;
  }


  _addToScene(treasure) {
    this.scene.add(treasure);
    this.treasures.push(treasure);
  }

  collect(treasure) {
    if (!treasure || !this.treasures.includes(treasure)) return;
    
    this._cleanupTreasure(treasure);
    gameState.treasuresCollected += 1;
    
    this.hud?.showMessage(
      `Treasure found! (${gameState.treasuresCollected}/${gameState.totalTreasures})`
    );
    
    if (gameState.treasuresCollected === gameState.totalTreasures) {
      this.hud?.showMessage("All treasures collected! Activate the exit!");
    }
  }

  _cleanupTreasure(treasure) {
    if (treasure.userData?.glowLight) {
      this.scene.remove(treasure.userData.glowLight);
    }
    this.scene.remove(treasure);
    this.treasures = this.treasures.filter(t => t !== treasure);
  }

  getTreasures() {
    return [...this.treasures]; // Return copy of array
  }

  dispose() {
    this.shellMaterial.dispose();
    this.coreMaterial.dispose();
    this.coreGeometry.dispose();
    
    this.treasures.forEach(treasure => {
      if (treasure.userData?.glowLight) {
        this.scene.remove(treasure.userData.glowLight);
      }
      this.scene.remove(treasure);
    });
    this.treasures = [];
  }
}