import * as THREE from 'three';

export const RuneEffects = {
rune_flight: {
  activate(player, scene, hud) {
    const camera = player.controls.object; // The FPS camera
    const originalPos = camera.position.clone();
    const flightHeight = 3;
    const duration = 3000;
    const cameraHeight = 1.6; // Typical eye-level height in FPS games
    const collisionRadius = 0.2; // Conservative estimate for player width

    // 1. Ascend immediately
    camera.position.y += flightHeight;
    hud?.showMessage("You float above the ground...");

    // 2. Prepare safe descent
    const performSafeDescent = () => {
      // Get all collidable objects including low walls
      const collidableObjects = [];
      scene.traverse(child => {
        if ((child.userData?.isObstacle || child.userData?.isWall || child.userData?.isLowWall) && child.geometry) {
          if (!child.geometry.boundingBox) {
            child.geometry.computeBoundingBox();
          }
          collidableObjects.push(child);
        }
      });

      // Check if position is safe (simple sphere collision)
      const isPositionSafe = (position) => {
        const cameraSphere = new THREE.Sphere(position, collisionRadius);
        
        for (const obstacle of collidableObjects) {
          const obstacleBox = new THREE.Box3().setFromObject(obstacle);
          if (cameraSphere.intersectsBox(obstacleBox)) {
            return false;
          }
        }
        return true;
      };

      // Find ground position with raycasting
      const findGroundPosition = () => {
        const groundRay = new THREE.Raycaster(
          camera.position.clone(),
          new THREE.Vector3(0, -1, 0),
          flightHeight * 2
        );

        const intersections = groundRay.intersectObjects(collidableObjects, true);
        
        if (intersections.length > 0) {
          // For low walls, land slightly above them
          if (intersections[0].object.userData?.isLowWall) {
            return intersections[0].point.y + 0.1; // Small buffer
          }
          return intersections[0].point.y + cameraHeight;
        }
        return originalPos.y; // No ground found, return to original height
      };

      const targetY = findGroundPosition();
      const targetPos = new THREE.Vector3(camera.position.x, targetY, camera.position.z);

      // If direct position isn't safe, find nearest safe spot
      const findSafeLanding = () => {
        if (isPositionSafe(targetPos)) {
          return targetPos;
        }

        // Search in expanding circles
        const directions = [
          new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0),
          new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1),
          new THREE.Vector3(1, 0, 1).normalize(), new THREE.Vector3(-1, 0, 1).normalize(),
          new THREE.Vector3(1, 0, -1).normalize(), new THREE.Vector3(-1, 0, -1).normalize()
        ];

        for (let distance = 0.5; distance <= 2; distance += 0.5) {
          for (const dir of directions) {
            const testPos = new THREE.Vector3(
              camera.position.x + dir.x * distance,
              targetY,
              camera.position.z + dir.z * distance
            );
            if (isPositionSafe(testPos)) {
              return testPos;
            }
          }
        }

        // Fallback - stay at current height
        return new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);
      };

      const safeLandingPos = findSafeLanding();
      animateDescent(safeLandingPos);
    };

    // Smooth descent animation
    const animateDescent = (targetPos) => {
      const startPos = camera.position.clone();
      const startTime = Date.now();
      const descentDuration = 1000; // ms

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / descentDuration, 1);
        
        // Linear interpolation
        camera.position.lerpVectors(startPos, targetPos, progress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          hud?.showMessage("Flight fades.");
        }
      };

      animate();
    };

    // 3. Start descent after duration
    setTimeout(performSafeDescent, duration);
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
      player.setMovementSpeed(2);
      hud?.showMessage("You feel a burst of speed!");
      setTimeout(() => {
        player.setMovementSpeed(1);
        hud?.showMessage("Speed fades.");
      }, 4000);
    },
  },

   rune_vision: {
  activate(player, scene, hud) {
    const visionDuration = 5000;
    hud?.showMessage("Your eyes glow with insight...");

    const xrayTargets = [];
    const originalMaterials = new Map();

    // 1. Highlight treasures (gold)
    scene.traverse(obj => {
      if (obj.userData?.isTreasure) {
        xrayTargets.push({ obj, color: 0xffff00 }); // gold
      }
    });

    // 2. Highlight exit door (blue)
    const exitDoor = scene.getObjectByName("exit_door");
    if (exitDoor) {
      xrayTargets.push({ obj: exitDoor, color: 0x42a5f5 }); // light blue
    }

    // 3. Highlight breakable/pass-through walls (gray)
    scene.traverse(obj => {
      if (obj.userData?.breakable || obj.userData?.passThrough) {
        xrayTargets.push({ obj, color: 0x999999 }); // soft gray
      }
    });

    // Apply ghost materials
    xrayTargets.forEach(({ obj, color }) => {
      if (!obj.material) return;
      originalMaterials.set(obj, obj.material);

      obj.material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.4,
        depthTest: false,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
    });

    // Restore after time
    setTimeout(() => {
      xrayTargets.forEach(({ obj }) => {
        if (originalMaterials.has(obj)) {
          obj.material.dispose?.();
          obj.material = originalMaterials.get(obj);
        }
      });

      hud?.showMessage("The vision fades...");
    }, visionDuration);
  }
},

};