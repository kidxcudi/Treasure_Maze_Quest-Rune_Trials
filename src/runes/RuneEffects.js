import * as THREE from 'three';

export const RuneEffects = {
  rune_flight: {
  activate(player, scene, hud) {
    const obj = player.controls.object;
    const originalPos = obj.position.clone(); // Save original position
    const flightHeight = 3;
    const duration = 3000;
    const descentSpeed = 0.05;
    const safeDistance = 0.5; // Buffer distance from walls

    // 1. Ascend immediately
    obj.position.y += flightHeight;
    hud?.showMessage("You float above the ground...");

    // 2. Prepare safe descent
    const performSafeDescent = () => {
      // Create collision tester
      const collisionTester = new THREE.Box3();
      const playerSize = new THREE.Vector3(player.radius, player.height, player.radius);
      
      const checkSafePosition = (position) => {
        collisionTester.setFromCenterAndSize(position, playerSize);
        
        let isSafe = true;
        scene.traverse(child => {
          if ((child.userData?.isObstacle || child.userData?.isWall) && child.geometry) {
            const childBox = new THREE.Box3().setFromObject(child);
            if (collisionTester.intersectsBox(childBox)) {
              isSafe = false;
            }
          }
        });
        
        return isSafe;
      };

      // Try direct descent first
      if (checkSafePosition(originalPos)) {
        obj.position.copy(originalPos);
        hud?.showMessage("Flight fades.");
        return;
      }

      // If direct position is blocked, find nearest safe spot
      const findSafeLanding = () => {
        const directions = [
          new THREE.Vector3(1, 0, 0),   // Right
          new THREE.Vector3(-1, 0, 0),  // Left
          new THREE.Vector3(0, 0, 1),   // Forward
          new THREE.Vector3(0, 0, -1),  // Backward
          new THREE.Vector3(1, 0, 1).normalize(),   // Diagonal
          new THREE.Vector3(-1, 0, 1).normalize(),  // Diagonal
          new THREE.Vector3(1, 0, -1).normalize(),  // Diagonal
          new THREE.Vector3(-1, 0, -1).normalize()  // Diagonal
        ];

        // Check in increasing distances
        for (let distance = 1; distance <= 5; distance += 1) {
          for (const dir of directions) {
            const testPos = originalPos.clone()
              .add(dir.clone().multiplyScalar(distance))
              .setY(originalPos.y);
            
            if (checkSafePosition(testPos)) {
              return testPos;
            }
          }
        }
        
        // Last resort - stay at current height
        return originalPos.clone().setY(obj.position.y);
      };

      const safeLandingPos = findSafeLanding();
      
      // Animate to safe position
      const animateDescent = () => {
        if (obj.position.distanceTo(safeLandingPos) < 0.1) {
          obj.position.copy(safeLandingPos);
          hud?.showMessage("Landed safely.");
          return;
        }

        obj.position.lerp(safeLandingPos, 0.1);
        requestAnimationFrame(animateDescent);
      };

      animateDescent();
    };

    // 3. Start controlled descent after duration
    setTimeout(() => {
      performSafeDescent();
    }, duration);
  }
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