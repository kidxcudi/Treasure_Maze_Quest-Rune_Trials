// src/core/physics/CollisionSystem.js
import * as THREE from 'three';

export class CollisionSystem {
  /**
   * Creates a new collision system
   * @param {THREE.Scene} scene - The game scene
   * @param {Object} config - Configuration options
   * @param {boolean} [config.debug=false] - Show debug visuals
   * @param {number} [config.playerColliderSize=0.4] - Player collider radius
   */
  constructor(scene, { debug = false, playerColliderSize = 0.4 } = {}) {
    this.colliders = [];
    this.scene = scene;
    this.debug = debug;
    this.playerColliderSize = playerColliderSize;
    this.debugHelpers = [];
  }

  /**
   * Initialize colliders from wall meshes
   * @param {THREE.Mesh[]} walls - Array of wall meshes
   */
  init(walls) {
    this.clearColliders();
    walls.forEach(wall => this.addCollider(wall));
  }

  /**
   * Add a new collider
   * @param {THREE.Mesh} mesh - The mesh to add as collider
   * @param {Object} [options] - Additional options
   * @param {boolean} [options.isJumpable] - Can be jumped over
   */
  addCollider(mesh, { isJumpable = false } = {}) {
    mesh.updateMatrixWorld(true);
    const collider = {
      mesh,
      box: new THREE.Box3().setFromObject(mesh),
      isJumpable
    };

    this.colliders.push(collider);

    if (this.debug) {
      const helper = new THREE.Box3Helper(collider.box, 0xff0000);
      this.scene.add(helper);
      this.debugHelpers.push(helper);
    }
  }

  /**
   * Check if position collides with any collider
   * @param {THREE.Vector3} position - Position to check
   * @param {Object} [options] - Collision options
   * @param {boolean} [options.canJump] - Can jump over obstacles
   * @returns {boolean} - True if collision detected
   */
  checkCollision(position, { canJump = false } = {}) {
    const playerBox = new THREE.Box3().setFromCenterAndSize(
      position.clone(),
      new THREE.Vector3().setScalar(this.playerColliderSize * 2)
    );

    return this.colliders.some(({ box, isJumpable }) => {
      if (isJumpable && canJump) return false;
      return box.intersectsBox(playerBox);
    });
  }

  /**
   * Clear all colliders and debug helpers
   */
  clearColliders() {
    if (this.debug) {
      this.debugHelpers.forEach(helper => this.scene.remove(helper));
      this.debugHelpers = [];
    }
    this.colliders = [];
  }

  /**
   * Toggle debug visualization
   * @param {boolean} enabled - Whether to show debug visuals
   */
  toggleDebug(enabled) {
    this.debug = enabled;
    this.debugHelpers.forEach(helper => {
      helper.visible = enabled;
    });
  }
}