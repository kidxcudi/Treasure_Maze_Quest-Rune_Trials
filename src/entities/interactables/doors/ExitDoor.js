import * as THREE from 'three';
import { maze1 } from '../../environment/maze/MazeLayout';

const tileSize = maze1.tileSize;

// Constants
const DOOR_CONFIG = {
  SIZE: {
    WIDTH: 2,
    HEIGHT: 3,
    DEPTH: 0.3
  },
  COLORS: {
    LOCKED: 0xffffff,
    UNLOCKED: 0x66ccff,
    FRAME: 0x1c1f22
  },
  MATERIALS: {
    LOCKED: {
      OPACITY: 0.35,
      EMISSIVE: 0x222222,
      EMISSIVE_INTENSITY: 0.15
    },
    UNLOCKED: {
      OPACITY: 1.0,
      EMISSIVE: 0x66ccff,
      EMISSIVE_INTENSITY: 0.6
    }
  },
  FRAME: {
    THICKNESS: 0.25,
    DEPTH: 0.5
  },
  INTERACTION: {
    WIDTH: 1.8,
    HEIGHT: 3.8,
    DEPTH: 0.2
  }
};

export class ExitDoor {
  constructor(scene, position) {
    this.scene = scene;
    this.locked = true;
    this.position = position.clone();
    this.position.z += 0.01; // Prevent z-fighting

    this._initMaterials();
    this._createDoor();
    this._createFrame();
    this._createInteractionMesh();

    this._addToScene();
  }

  _initMaterials() {
    this.doorMaterial = new THREE.MeshStandardMaterial({
      color: DOOR_CONFIG.COLORS.LOCKED,
      transparent: true,
      opacity: DOOR_CONFIG.MATERIALS.LOCKED.OPACITY,
      emissive: new THREE.Color(DOOR_CONFIG.MATERIALS.LOCKED.EMISSIVE),
      emissiveIntensity: DOOR_CONFIG.MATERIALS.LOCKED.EMISSIVE_INTENSITY
    });

    this.frameMaterial = new THREE.MeshStandardMaterial({
      color: DOOR_CONFIG.COLORS.FRAME
    });

    this.interactionMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });
  }

  _createDoor() {
    const geometry = new THREE.BoxGeometry(
      DOOR_CONFIG.SIZE.WIDTH,
      DOOR_CONFIG.SIZE.HEIGHT,
      DOOR_CONFIG.SIZE.DEPTH
    );

    this.doorMesh = new THREE.Mesh(geometry, this.doorMaterial);
    this.doorMesh.position.copy(this.position);
    this.doorMesh.userData.requiredRune = null;
    this.doorMesh.name = "exit_door";
  }

  _createFrame() {
    this.frameGroup = new THREE.Group();
    this.frameGroup.position.copy(this.position);

    const { WIDTH, HEIGHT } = DOOR_CONFIG.SIZE;
    const { THICKNESS, DEPTH } = DOOR_CONFIG.FRAME;

    // Left frame
    const left = new THREE.Mesh(
      new THREE.BoxGeometry(THICKNESS, HEIGHT, DEPTH),
      this.frameMaterial
    );
    left.position.set(-WIDTH / 2 - THICKNESS / 2, 0, 0);

    // Right frame
    const right = new THREE.Mesh(
      new THREE.BoxGeometry(THICKNESS, HEIGHT, DEPTH),
      this.frameMaterial
    );
    right.position.set(WIDTH / 2 + THICKNESS / 2, 0, 0);

    // Top frame
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(WIDTH + THICKNESS * 2, THICKNESS, DEPTH),
      this.frameMaterial
    );
    top.position.set(0, HEIGHT / 2 + THICKNESS / 2, 0);

    this.frameGroup.add(left);
    this.frameGroup.add(right);
    this.frameGroup.add(top);
  }

  _createInteractionMesh() {
    const geometry = new THREE.BoxGeometry(
      DOOR_CONFIG.INTERACTION.WIDTH,
      DOOR_CONFIG.INTERACTION.HEIGHT,
      DOOR_CONFIG.INTERACTION.DEPTH
    );

    this.interactionMesh = new THREE.Mesh(geometry, this.interactionMaterial);
    this.interactionMesh.position.copy(this.position);
    this.interactionMesh.name = "exit_door_hitbox";
  }

  _addToScene() {
    this.scene.add(this.doorMesh);
    this.scene.add(this.frameGroup);
    this.scene.add(this.interactionMesh);
  }

  getObject() {
    return this.interactionMesh;
  }

  isUnlocked() {
    return !this.locked;
  }

  setLocked() {
    this.locked = true;
    this.doorMesh.material.color.set(DOOR_CONFIG.COLORS.LOCKED);
    this.doorMesh.material.opacity = DOOR_CONFIG.MATERIALS.LOCKED.OPACITY;
    this.doorMesh.material.emissive.set(DOOR_CONFIG.MATERIALS.LOCKED.EMISSIVE);
  }

  setUnlocked() {
    this.locked = false;
    this.doorMesh.material.color.set(DOOR_CONFIG.COLORS.UNLOCKED);
    this.doorMesh.material.opacity = DOOR_CONFIG.MATERIALS.UNLOCKED.OPACITY;
    this.doorMesh.material.emissive.set(DOOR_CONFIG.MATERIALS.UNLOCKED.EMISSIVE);
    this.doorMesh.material.emissiveIntensity = 
      DOOR_CONFIG.MATERIALS.UNLOCKED.EMISSIVE_INTENSITY;
  }

  setOpen() {
    this.doorMesh.visible = false;
    this.interactionMesh.visible = false;
  }

  resetVisual() {
    this.setLocked();
  }

  dispose() {
    this.doorMesh.geometry.dispose();
    this.doorMaterial.dispose();
    this.frameMaterial.dispose();
    this.interactionMaterial.dispose();
    
    this.frameGroup.children.forEach(child => {
      child.geometry.dispose();
    });
  }
}

export function spawnExitDoor(scene, mazeLayout) {
  const { x, z } = mazeLayout.objects.exit;
  const doorHeight = DOOR_CONFIG.SIZE.HEIGHT;
  const offset = tileSize / (Math.random() < 0.5 ? -2 : 2);
  
  const position = new THREE.Vector3(
    x * tileSize + offset,
    doorHeight / 2,
    z * tileSize + offset
  );

  return new ExitDoor(scene, position);
}