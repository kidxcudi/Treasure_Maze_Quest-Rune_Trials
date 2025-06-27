// src/exit/ExitDoor.js
import * as THREE from 'three';
import { maze1 } from '../maze/mazeLayout.js';

const tileSize = maze1.tileSize;

export class ExitDoor {
  constructor(scene, position) {
    this.scene = scene;
    this.locked = true;

    this.doorMesh = this.createDoorMesh();
    this.frameMesh = this.createFrameMesh();
    this.interactionMesh = this.createInteractionMesh(); // 🎯 accurate click target

    this.doorMesh.position.copy(position);
    this.doorMesh.position.z += 0.01; // prevent z-fighting
    this.frameMesh.position.copy(position);
    this.interactionMesh.position.copy(position);

    this.doorMesh.userData.requiredRune = null;
    this.doorMesh.name = "exit_door";
    this.interactionMesh.name = "exit_door_hitbox";

    this.scene.add(this.doorMesh);
    this.scene.add(this.frameMesh);
    this.scene.add(this.interactionMesh);
  }

  createDoorMesh() {
    const geometry = new THREE.BoxGeometry(2, 4, 0.3);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      emissive: new THREE.Color(0x222222),
      emissiveIntensity: 0.15,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.isTreasure = true;
    return mesh;
  }

  createFrameMesh() {
    const frameGroup = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({ color: 0x1c1f22 });

    const barThickness = 0.25;
    const doorWidth = 2;
    const doorHeight = 4;

    const yOffset = 0;

    const left = new THREE.Mesh(
      new THREE.BoxGeometry(barThickness, doorHeight, 0.5),
      material
    );
    left.position.set(-doorWidth / 2 - barThickness / 2, yOffset, 0);
    frameGroup.add(left);

    const right = new THREE.Mesh(
      new THREE.BoxGeometry(barThickness, doorHeight, 0.5),
      material
    );
    right.position.set(doorWidth / 2 + barThickness / 2, yOffset, 0);
    frameGroup.add(right);

    const top = new THREE.Mesh(
      new THREE.BoxGeometry(doorWidth + barThickness * 2, barThickness, 0.5),
      material
    );
    top.position.set(0, doorHeight / 2 + barThickness / 2, 0);
    frameGroup.add(top);

    return frameGroup;
  }

  createInteractionMesh() {
    const geometry = new THREE.BoxGeometry(1.8, 3.8, 0.2); // 🎯 slightly smaller
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.0, // completely invisible
      depthWrite: false,
    });
    return new THREE.Mesh(geometry, material);
  }

  getObject() {
    return this.interactionMesh; // 🔁 interaction now uses smaller target
  }

  isUnlocked() {
    return !this.locked;
  }

  setLocked() {
    this.locked = true;
    this.doorMesh.material.color.set(0xffffff);
    this.doorMesh.material.opacity = 0.3;
    this.doorMesh.material.transparent = true;
    this.doorMesh.material.emissive.set(0x000000);
  }

  setUnlocked() {
    this.locked = false;
    this.doorMesh.material.color.set(0x66ccff);
    this.doorMesh.material.opacity = 1.0;
    this.doorMesh.material.transparent = false;
    this.doorMesh.material.emissive.set(0x66ccff);
    this.doorMesh.material.emissiveIntensity = 0.6;
  }

  setOpen() {
    this.doorMesh.visible = false;
    this.interactionMesh.visible = false; // 🔕 stop interaction after open
  }

  resetVisual() {
    this.setLocked();
  }
}

export function spawnExitDoor(scene) {
  const { x, z } = maze1.objects.exit;
  const rl = Math.random() < 0.5 ? -1 : 1;
  const lr = Math.random() < 0.5 ? -1 : 1;
  const worldX = x * tileSize + tileSize / (rl * 2);
  const worldZ = z * tileSize + tileSize / (lr * 2);
  const position = new THREE.Vector3(worldX, 1, worldZ);

  return new ExitDoor(scene, position);
}
