import * as THREE from 'three';

export class ExitMechanism {
  constructor(scene, position, gameManager) {
    this.scene = scene;
    this.position = position;
    this.gameManager = gameManager;

    this.mesh = this.createMechanismMesh();
    this.scene.add(this.mesh);
  }

  createMechanismMesh() {
    const geometry = new THREE.CylinderGeometry(1, 1, 0.4, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffcc00,
      emissive: 0xffcc00,
      emissiveIntensity: 1,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(this.position);
    mesh.name = "exit_mechanism";

    return mesh;
  }

  getObject() {
    return this.mesh;
  }

  activate() {
    console.log("🚨 Exit mechanism activated");  // ✅ Add this
    this.gameManager.triggerExitTimer();
    this.scene.remove(this.mesh);
    }

}
