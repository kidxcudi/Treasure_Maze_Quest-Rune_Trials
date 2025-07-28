import * as THREE from 'three';
import { setupLighting } from './Lighting.js';

// Constants
const SCENE_CONFIG = {
  BACKGROUND: 0x87ceeb, // Sky blue
  FOG: {
    COLOR: 0x87ceeb,
    NEAR: 20,
    FAR: 100
  },
  CAMERA: {
    FOV: 75,
    NEAR: 0.1,
    FAR: 1000
  },
  GROUND: {
    SIZE: 100,
    COLOR: 0xd8cab8, // Sand
    ROTATION: -Math.PI / 2
  },
  RENDERER: {
    ANTIALIAS: true,
    SHADOW_MAP: {
      ENABLED: true,
      TYPE: THREE.PCFSoftShadowMap
    }
  }
};

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this._initScene();
    this._initCamera();
    this._initRenderer();
    this._setupEnvironment();
  }

  _initScene() {
    // Set background and fog
    this.scene.background = new THREE.Color(SCENE_CONFIG.BACKGROUND);
    this.scene.fog = new THREE.Fog(
      SCENE_CONFIG.FOG.COLOR,
      SCENE_CONFIG.FOG.NEAR,
      SCENE_CONFIG.FOG.FAR
    );
  }

  _initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      SCENE_CONFIG.CAMERA.FOV,
      window.innerWidth / window.innerHeight,
      SCENE_CONFIG.CAMERA.NEAR,
      SCENE_CONFIG.CAMERA.FAR
    );
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: SCENE_CONFIG.RENDERER.ANTIALIAS
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = SCENE_CONFIG.RENDERER.SHADOW_MAP.ENABLED;
    this.renderer.shadowMap.type = SCENE_CONFIG.RENDERER.SHADOW_MAP.TYPE;
    this.container.appendChild(this.renderer.domElement);
  }

  _setupEnvironment() {
    // Lighting setup
    setupLighting(this.scene);

    // Ground plane
    this.ground = new THREE.Mesh(
      new THREE.PlaneGeometry(SCENE_CONFIG.GROUND.SIZE, SCENE_CONFIG.GROUND.SIZE),
      new THREE.MeshStandardMaterial({ color: SCENE_CONFIG.GROUND.COLOR })
    );
    this.ground.rotation.x = SCENE_CONFIG.GROUND.ROTATION;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  dispose() {
    // Cleanup ground geometry and material
    this.ground.geometry.dispose();
    this.ground.material.dispose();

    // Remove renderer DOM element
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }

    // Dispose renderer
    this.renderer.dispose();

    // Clear scene
    while(this.scene.children.length > 0) {
      const child = this.scene.children[0];
      if (child.dispose) child.dispose();
      this.scene.remove(child);
    }
  }
}

// Legacy function for backward compatibility
export function initScene(container) {
  return new SceneManager(container);
}