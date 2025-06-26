import * as THREE from 'three';

export const RuneEffects = {
  rune_flight: {
    activate(player, scene, hud) {
      const obj = player.controls.object;
      obj.position.y += 15;
      hud?.showMessage("You float above the ground...");
      setTimeout(() => {
        obj.position.y -= 15;
        hud?.showMessage("Flight fades.");
      }, 3000);
    },
  },

  rune_blink: {
  activate(player, scene, hud) {
    const obj = player.controls.object; // Player's three.js Object3D
    const direction = new THREE.Vector3();
    player.controls.getDirection(direction); // full 3D direction including Y
    direction.normalize();

    const maxBlinkDistance = 5;

    // Create raycaster from player's current position forward
    const raycaster = new THREE.Raycaster(obj.position.clone(), direction);

    // Collect all obstacles (walls/floor) in scene
    const obstacles = [];
    scene.traverse(child => {
      if (child.userData.isObstacle) {
        obstacles.push(child);
      }
    });

    const intersections = raycaster.intersectObjects(obstacles, true);

    let blinkDistance = maxBlinkDistance;

    if (intersections.length > 0) {
      const dist = intersections[0].distance;
      const buffer = 0.5; // safe gap so player doesn't clip into obstacle
      blinkDistance = Math.max(0, dist - buffer);
    }

    if (blinkDistance <= 0) {
      hud?.showMessage("Blink blocked! Too close to obstacle.");
      return;
    }

    // Calculate new position
    const newPos = obj.position.clone().add(direction.multiplyScalar(blinkDistance));

    // Clamp Y so player doesn't go below floor height (assumed 1 unit here)
    const floorHeight = 1;
    if (newPos.y < floorHeight) {
      newPos.y = floorHeight;
    }

    // Set player position to new location
    obj.position.copy(newPos);

    hud?.showMessage("You blink forward through space.");
  }
},



  rune_strength: {
    activate(player, scene, hud) {
      player.canBreakWalls = true;
      hud?.showMessage("You feel powerful... walls can be broken!");
      setTimeout(() => {
        player.canBreakWalls = false;
        hud?.showMessage("Your strength fades.");
      }, 5000);
    },
  },

  rune_speed: {
    activate(player, scene, hud) {
      player.setSpeedMultiplier(2);
      hud?.showMessage("You feel a burst of speed!");
      setTimeout(() => {
        player.setSpeedMultiplier(1);
        hud?.showMessage("Speed fades.");
      }, 4000);
    },
  },

   rune_vision: {
    activate(player, scene, hud) {
      const visionDuration = 5000; // 5 seconds
      hud?.showMessage("Your eyes glow with insight...");

      // Find treasures in scene
      const treasures = [];
      scene.traverse(obj => {
        if (obj.userData?.isTreasure) {
          treasures.push(obj);
        }
      });

      const originalMaterials = new Map();

      // Apply "x-ray" effect
      treasures.forEach(treasure => {
        if (!treasure.material) return;

        originalMaterials.set(treasure, treasure.material);

        treasure.material = new THREE.MeshBasicMaterial({
          color: 0xffff00,
          transparent: true,
          opacity: 0.6,
          depthTest: false,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        });
      });

      // Revert after visionDuration
      setTimeout(() => {
        treasures.forEach(treasure => {
          if (originalMaterials.has(treasure)) {
            treasure.material = originalMaterials.get(treasure);
          }
        });
        hud?.showMessage("The vision fades...");
      }, visionDuration);
    }
   },
};