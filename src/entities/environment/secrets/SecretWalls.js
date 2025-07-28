import * as THREE from 'three';
import { maze1 } from '../maze/MazeLayout';

const tileSize = maze1.tileSize;

// Constants
const WALL_COLORS = {
  PASS_THROUGH: 0x1c1f22,
  BREAKABLE: 0x773333,
  LOW_WALL: 0x22272b,
  QUICKSAND: {
    BASE: 0x665533,
    EMISSIVE: 0x332200
  }
};

const WALL_HEIGHTS = {
  STANDARD: 2,
  LOW: 0.5
};

export class SecretWallSystem {
  constructor(scene, interactionManager, hud) {
    this.scene = scene;
    this.interactionManager = interactionManager;
    this.hud = hud;
    this.secretObjects = [];
    this.wallColliders = [];
  }

  spawnEasterEgg({ x, z, type }) {
    const posX = x * tileSize;
    const posZ = z * tileSize;
    let createdMesh = null;

    switch (type) {
      case 'pass_through':
        createdMesh = this._createPassThroughWall(posX, posZ);
        break;
      case 'breakable':
        createdMesh = this._createBreakableWall(posX, posZ);
        break;
      case 'low_wall':
        createdMesh = this._createLowWall(posX, posZ);
        break;
      case 'quicksand':
        this._createQuicksand(posX, posZ);
        break;
    }

    return createdMesh;
  }

  _createPassThroughWall(x, z) {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(tileSize, tileSize * WALL_HEIGHTS.STANDARD, tileSize),
      new THREE.MeshStandardMaterial({
        color: WALL_COLORS.PASS_THROUGH,
        transparent: true,
        opacity: 0.98
      })
    );
    wall.position.set(x, tileSize, z);
    wall.userData.isObstacle = false;
    this.scene.add(wall);
    return wall;
  }

  _createBreakableWall(x, z) {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(tileSize, tileSize * WALL_HEIGHTS.STANDARD, tileSize),
      new THREE.MeshStandardMaterial({ color: WALL_COLORS.BREAKABLE })
    );
    wall.position.set(x, tileSize, z);
    wall.userData = {
      breakable: true,
      isObstacle: true
    };
    this.scene.add(wall);
    this.secretObjects.push(wall);
    return wall;
  }

  _createLowWall(x, z) {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(tileSize, tileSize * WALL_HEIGHTS.LOW, tileSize),
      new THREE.MeshStandardMaterial({ color: WALL_COLORS.LOW_WALL })
    );
    wall.position.set(x, tileSize * 0.25, z);
    wall.userData.isObstacle = true;
    this.scene.add(wall);
    this.secretObjects.push(wall);
    return wall;
  }

  _createQuicksand(x, z) {
    // Visual representation
    const visual = new THREE.Mesh(
      new THREE.CylinderGeometry(tileSize * 0.4, tileSize * 0.5, 0.2, 32),
      new THREE.MeshStandardMaterial({
        color: WALL_COLORS.QUICKSAND.BASE,
        transparent: true,
        opacity: 0.8,
        roughness: 1,
        metalness: 0,
        emissive: new THREE.Color(WALL_COLORS.QUICKSAND.EMISSIVE),
        emissiveIntensity: 0.1
      })
    );
    visual.position.set(x, 0, z);
    this.scene.add(visual);

    // Invisible trigger
    const trigger = new THREE.Mesh(
      new THREE.BoxGeometry(tileSize, 2, tileSize),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    trigger.position.set(x, 1, z);
    trigger.userData.isQuicksand = true;
    this.scene.add(trigger);
    this.secretObjects.push(trigger);
  }

  tryBreakWall(wall, canBreak) {
    if (!wall?.userData?.breakable) return false;

    if (canBreak) {
      this._destroyWall(wall);
      this.hud?.showMessage("Wall shattered!");
      return true;
    } else {
      this.hud?.showMessage("You need the Strength rune to break this wall!");
      return false;
    }
  }

  _destroyWall(wall) {
    // Remove from all systems
    this.interactionManager?.removeInteractable(wall);
    this._removeFromColliders(wall);
    this._removeFromSecretObjects(wall);
    this._cleanupSceneObjects(wall);
    this._disposeResources(wall);
  }

  _removeFromColliders(wall) {
    const index = this.wallColliders.findIndex(entry => entry.mesh === wall);
    if (index !== -1) this.wallColliders.splice(index, 1);
  }

  _removeFromSecretObjects(wall) {
    const index = this.secretObjects.indexOf(wall);
    if (index !== -1) this.secretObjects.splice(index, 1);
  }

  _cleanupSceneObjects(wall) {
    if (wall.parent === this.scene) {
      this.scene.remove(wall);
    }
  }

  _disposeResources(wall) {
    wall.geometry?.dispose();
    
    if (wall.material) {
      Array.isArray(wall.material) 
        ? wall.material.forEach(m => m.dispose())
        : wall.material.dispose();
    }
    
    wall.userData = {};
  }

  handleSecretCollision(object, player) {
    return this.tryBreakWall(object, player.canBreakWalls);
  }

  checkBreakableWallProximity(playerPosition, canBreakWalls) {
    for (const wall of this.secretObjects) {
      if (!wall.userData?.breakable) continue;

      if (playerPosition.distanceTo(wall.position) < 3.4) {
        this.tryBreakWall(wall, canBreakWalls);
        return;
      }
    }
  }

  // Inside SecretWallSystem.js
  update(player) {
    const playerPos = player.controls.object.position;
    const canBreakWalls = player.canBreakWalls || false;
    this.checkBreakableWallProximity(playerPos, canBreakWalls);
  }

}