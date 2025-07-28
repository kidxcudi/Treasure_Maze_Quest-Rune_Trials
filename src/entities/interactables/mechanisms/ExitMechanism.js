import * as THREE from 'three';

// Constants
const MECHANISM_CONFIG = {
  GEOMETRY: {
    RADIUS: 0.5,
    HEIGHT: 0.4,
    SEGMENTS: 32
  },
  MATERIAL: {
    COLOR: 0xffcc00,
    EMISSIVE: 0xffcc00,
    EMISSIVE_INTENSITY: 1
  },
  POSITION: {
    Y_OFFSET: 0.5,
    RANDOM_OFFSET: 2.1
  },
  ROTATION: Math.PI / 2 // Rotate to face the player
};

export class ExitMechanism {
  constructor(scene, position, gameManager) {
    this.scene = scene;
    this.position = position;
    this.gameManager = gameManager;
    this._initialized = false;

    this.init();
  }

  init() {
    if (this._initialized) return;

    this.mesh = this._createMechanismMesh();
    this.scene.add(this.mesh);
    this._initialized = true;
  }

  _createMechanismMesh() {
    const geometry = new THREE.CylinderGeometry(
      MECHANISM_CONFIG.GEOMETRY.RADIUS,
      MECHANISM_CONFIG.GEOMETRY.RADIUS,
      MECHANISM_CONFIG.GEOMETRY.HEIGHT,
      MECHANISM_CONFIG.GEOMETRY.SEGMENTS
    );

    const material = new THREE.MeshStandardMaterial({
      color: MECHANISM_CONFIG.MATERIAL.COLOR,
      emissive: MECHANISM_CONFIG.MATERIAL.EMISSIVE,
      emissiveIntensity: MECHANISM_CONFIG.MATERIAL.EMISSIVE_INTENSITY
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(this.position);
    mesh.rotation.x = MECHANISM_CONFIG.ROTATION;
    mesh.name = "exit_mechanism";
    mesh.userData.isInteractable = true;

    return mesh;
  }

  getObject() {
    return this.mesh;
  }

  activate() {
    if (!this._initialized) return;

    console.log("🚨 Exit mechanism activated");
    this.gameManager.triggerExitTimer();
    this._cleanup();
  }

  _cleanup() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.mesh = null;
    }
    this._initialized = false;
  }

  dispose() {
    this._cleanup();
  }
}

export function spawnExitMechanism(scene, gameManager, mazeLayout) {
  if (!mazeLayout?.objects?.exitMechanism) {
    console.warn("Exit mechanism position not defined in maze layout.");
    return null;
  }

  const tileSize = mazeLayout.tileSize;
  const { x, z } = mazeLayout.objects.exitMechanism;
  const offsetDirection = Math.random() < 0.5 ? -1 : 1;
  const offset = tileSize / (offsetDirection * MECHANISM_CONFIG.POSITION.RANDOM_OFFSET);

  const position = new THREE.Vector3(
    x * tileSize + offset,
    MECHANISM_CONFIG.POSITION.Y_OFFSET,
    z * tileSize + offset
  );

  return new ExitMechanism(scene, position, gameManager);
}
