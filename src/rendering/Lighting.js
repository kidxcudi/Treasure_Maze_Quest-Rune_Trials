import * as THREE from 'three';

// Lighting configuration constants
const LIGHTING_CONFIG = {
  AMBIENT: {
    COLOR: 0x404040,
    INTENSITY: 0.2
  },
  HEMISPHERE: {
    SKY_COLOR: 0x5577aa,
    GROUND_COLOR: 0x886622,
    INTENSITY: 0.5,
    POSITION: { x: 0, y: 20, z: 0 }
  },
  DIRECTIONAL: {
    COLOR: 0xfff4e6,
    INTENSITY: 0.7,
    POSITION: { x: 7, y: 20, z: 8 },
    SHADOW: {
      MAP_SIZE: 1024,
      CAMERA: {
        NEAR: 0.5,
        FAR: 40,
        LEFT: -15,
        RIGHT: 15,
        TOP: 15,
        BOTTOM: -15
      },
      RADIUS: 2
    }
  },
  FILL: {
    COLOR: 0x4466ff,
    INTENSITY: 0.2,
    DISTANCE: 25,
    POSITION: { x: -10, y: 5, z: -10 },
    DECAY: 2
  },
  RIM: {
    COLOR: 0xffffff,
    INTENSITY: 0.3,
    POSITION: { x: -5, y: 10, z: 10 }
  },
  FOG: {
    COLOR: 0x111122,
    DENSITY: 0.025
  }
};

export class LightingManager {
  constructor(scene) {
    this.scene = scene;
    this.lights = new Map();
    this._setupLights();
  }

  _setupLights() {
    this._createAmbientLight();
    this._createHemisphereLight();
    this._createDirectionalLight();
    this._createFillLight();
    this._createRimLight();
    this._setupFog();
  }

  _createAmbientLight() {
    const light = new THREE.AmbientLight(
      LIGHTING_CONFIG.AMBIENT.COLOR,
      LIGHTING_CONFIG.AMBIENT.INTENSITY
    );
    this.scene.add(light);
    this.lights.set('ambient', light);
  }

  _createHemisphereLight() {
    const light = new THREE.HemisphereLight(
      LIGHTING_CONFIG.HEMISPHERE.SKY_COLOR,
      LIGHTING_CONFIG.HEMISPHERE.GROUND_COLOR,
      LIGHTING_CONFIG.HEMISPHERE.INTENSITY
    );
    light.position.set(
      LIGHTING_CONFIG.HEMISPHERE.POSITION.x,
      LIGHTING_CONFIG.HEMISPHERE.POSITION.y,
      LIGHTING_CONFIG.HEMISPHERE.POSITION.z
    );
    this.scene.add(light);
    this.lights.set('hemisphere', light);
  }

  _createDirectionalLight() {
    const light = new THREE.DirectionalLight(
      LIGHTING_CONFIG.DIRECTIONAL.COLOR,
      LIGHTING_CONFIG.DIRECTIONAL.INTENSITY
    );
    light.position.set(
      LIGHTING_CONFIG.DIRECTIONAL.POSITION.x,
      LIGHTING_CONFIG.DIRECTIONAL.POSITION.y,
      LIGHTING_CONFIG.DIRECTIONAL.POSITION.z
    );
    light.castShadow = true;

    // Shadow configuration
    light.shadow.mapSize.width = LIGHTING_CONFIG.DIRECTIONAL.SHADOW.MAP_SIZE;
    light.shadow.mapSize.height = LIGHTING_CONFIG.DIRECTIONAL.SHADOW.MAP_SIZE;
    light.shadow.camera.near = LIGHTING_CONFIG.DIRECTIONAL.SHADOW.CAMERA.NEAR;
    light.shadow.camera.far = LIGHTING_CONFIG.DIRECTIONAL.SHADOW.CAMERA.FAR;
    light.shadow.camera.left = LIGHTING_CONFIG.DIRECTIONAL.SHADOW.CAMERA.LEFT;
    light.shadow.camera.right = LIGHTING_CONFIG.DIRECTIONAL.SHADOW.CAMERA.RIGHT;
    light.shadow.camera.top = LIGHTING_CONFIG.DIRECTIONAL.SHADOW.CAMERA.TOP;
    light.shadow.camera.bottom = LIGHTING_CONFIG.DIRECTIONAL.SHADOW.CAMERA.BOTTOM;
    light.shadow.radius = LIGHTING_CONFIG.DIRECTIONAL.SHADOW.RADIUS;

    this.scene.add(light);
    this.lights.set('directional', light);
  }

  _createFillLight() {
    const light = new THREE.PointLight(
      LIGHTING_CONFIG.FILL.COLOR,
      LIGHTING_CONFIG.FILL.INTENSITY,
      LIGHTING_CONFIG.FILL.DISTANCE,
      LIGHTING_CONFIG.FILL.DECAY
    );
    light.position.set(
      LIGHTING_CONFIG.FILL.POSITION.x,
      LIGHTING_CONFIG.FILL.POSITION.y,
      LIGHTING_CONFIG.FILL.POSITION.z
    );
    this.scene.add(light);
    this.lights.set('fill', light);
  }

  _createRimLight() {
    const light = new THREE.DirectionalLight(
      LIGHTING_CONFIG.RIM.COLOR,
      LIGHTING_CONFIG.RIM.INTENSITY
    );
    light.position.set(
      LIGHTING_CONFIG.RIM.POSITION.x,
      LIGHTING_CONFIG.RIM.POSITION.y,
      LIGHTING_CONFIG.RIM.POSITION.z
    );
    this.scene.add(light);
    this.lights.set('rim', light);
  }

  _setupFog() {
    this.scene.fog = new THREE.FogExp2(
      LIGHTING_CONFIG.FOG.COLOR,
      LIGHTING_CONFIG.FOG.DENSITY
    );
  }

  updateLight(name, properties) {
    const light = this.lights.get(name);
    if (!light) return;

    if (properties.color !== undefined) {
      light.color.set(properties.color);
    }
    if (properties.intensity !== undefined) {
      light.intensity = properties.intensity;
    }
    if (properties.position !== undefined) {
      light.position.set(
        properties.position.x,
        properties.position.y,
        properties.position.z
      );
    }
  }

  dispose() {
    this.lights.forEach(light => {
      if (light.dispose) light.dispose();
      this.scene.remove(light);
    });
    this.lights.clear();
    this.scene.fog = null;
  }
}

// Legacy function for backward compatibility
export function setupLighting(scene) {
  return new LightingManager(scene);
}