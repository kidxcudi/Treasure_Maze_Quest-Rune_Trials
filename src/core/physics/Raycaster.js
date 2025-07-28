// src/core/physics/Raycaster.js
import * as THREE from 'three';

export class GameRaycaster extends THREE.Raycaster {
  /**
   * Enhanced raycaster with game-specific functionality
   * @param {THREE.Camera} camera 
   * @param {Object} config 
   * @param {number} config.range - Max interaction distance
   * @param {boolean} config.debug - Show debug visuals
   */
  constructor(camera, { range = 5, debug = false } = {}) {
    super();
    this.camera = camera;
    this.far = range;
    this.debug = debug;
    this.mouse = new THREE.Vector2();
    this.debugHelpers = [];
  }

  /**
   * Update mouse coordinates from event
   * @param {MouseEvent} event 
   */
  updateFromEvent(event) {
  // Always cast from center for crosshair interaction
    this.mouse.x = 0;
    this.mouse.y = 0;
  }


  /**
   * Get intersections with prioritized objects
   * @param {Object} targets 
   * @returns {Array} Sorted intersections
   */
  getIntersections(targets) {
    this.setFromCamera(this.mouse, this.camera);
    
    const allIntersections = [];
    
    // Check each object type in priority order
    if (targets.runes) {
      const hits = this.intersectObjects(targets.runes, true);
      hits.forEach(h => h.objectType = 'rune');
      allIntersections.push(...hits);
    }
    
    if (targets.doors) {
      const hits = this.intersectObjects(targets.doors, true);
      hits.forEach(h => h.objectType = 'door');
      allIntersections.push(...hits);
    }

    // Add other object types similarly...

    // Sort by distance and return
    return allIntersections.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Add debug visualization for raycast
   * @param {THREE.Scene} scene 
   */
  enableDebug(scene) {
    if (!this.debug) return;
    
    const rayHelper = new THREE.ArrowHelper(
      this.ray.direction,
      this.ray.origin,
      this.far,
      0xff0000,
      0.2,
      0.1
    );
    scene.add(rayHelper);
    this.debugHelpers.push(rayHelper);
  }

  /**
   * Clean up debug visuals
   * @param {THREE.Scene} scene 
   */
  disableDebug(scene) {
    this.debugHelpers.forEach(helper => scene.remove(helper));
    this.debugHelpers = [];
  }
}