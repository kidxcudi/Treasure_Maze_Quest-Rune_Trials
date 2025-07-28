import * as THREE from 'three';
import { animationSystem, AnimationSystem } from '../../../core/utils/animation.js';

const EFFECT_DURATIONS = {
  FLIGHT: { BOUNCE: 0.3, ASCENT: 0.7, SUSPEND: 3, DESCENT: 1 },
  BLINK: { TELEPORT: 0.15, COOLDOWN: 0.15 },
  STRENGTH: 5000,
  SPEED: 4000,
  VISION: 5000
};

const VISUAL_CONFIG = {
  FLIGHT_HEIGHT: 3,
  BOUNCE_HEIGHT: 0.3,
  BLINK_DISTANCE: 5,
  BLINK_BUFFER: 0.5,
  MIN_FLOOR_HEIGHT: 1
};

export class RuneEffects {
  static rune_flight(player, scene, hud) {
    const camera = player.controls.object;
    const originalY = camera.position.y;

    AnimationSystem.animatePosition(camera, {
      from: new THREE.Vector3(camera.position.x, originalY, camera.position.z),
      to: new THREE.Vector3(camera.position.x, originalY + VISUAL_CONFIG.BOUNCE_HEIGHT, camera.position.z),
      duration: EFFECT_DURATIONS.FLIGHT.BOUNCE,
      easing: t => t*(2 - t),  // quad easing
      onUpdate: pos => camera.position.copy(pos),
      onComplete: () => RuneEffects._ascendFlight(camera, originalY, scene, hud)
    });

    hud?.showMessage("You prepare to float...");
  }

  static _ascendFlight(camera, originalY, scene, hud) {
    AnimationSystem.animatePosition(camera, {
      from: camera.position.clone(),
      to: new THREE.Vector3(camera.position.x, originalY + VISUAL_CONFIG.FLIGHT_HEIGHT, camera.position.z),
      duration: EFFECT_DURATIONS.FLIGHT.ASCENT,
      easing: t => t * (2 - t),
      onUpdate: pos => camera.position.copy(pos),
      onComplete: () => {
        hud?.showMessage("You float above the ground...");
        setTimeout(() => RuneEffects._performSafeDescent(camera, originalY, scene, hud), EFFECT_DURATIONS.FLIGHT.SUSPEND * 1000);
      }
    });
  }

  static _performSafeDescent(camera, originalY, scene, hud) {
    const collisionRadius = 0.2;
    const collidableObjects = [];
    scene.traverse(obj => {
      if ((obj.userData?.isObstacle || obj.userData?.isWall || obj.userData?.isLowWall) && obj.geometry) {
        if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
        collidableObjects.push(obj);
      }
    });

    const isSafe = (pos) => {
      const sphere = new THREE.Sphere(pos, collisionRadius);
      return !collidableObjects.some(obj => sphere.intersectsBox(new THREE.Box3().setFromObject(obj)));
    };

    const downRay = new THREE.Raycaster(camera.position.clone(), new THREE.Vector3(0, -1, 0), 0, VISUAL_CONFIG.FLIGHT_HEIGHT * 2);
    const hits = downRay.intersectObjects(collidableObjects, true);
    let targetY = originalY;
    if (hits.length) {
      targetY = hits[0].object.userData?.isLowWall ? hits[0].point.y + 0.1 : hits[0].point.y + 1.6;
    }

    let targetPos = new THREE.Vector3(camera.position.x, targetY, camera.position.z);

    if (!isSafe(targetPos)) {
      const directions = [
        new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1),
        new THREE.Vector3(1, 0, 1).normalize(), new THREE.Vector3(-1, 0, 1).normalize(),
        new THREE.Vector3(1, 0, -1).normalize(), new THREE.Vector3(-1, 0, -1).normalize()
      ];

      let foundSafe = false;
      for (let dist = 0.5; dist <= 2 && !foundSafe; dist += 0.5) {
        for (const dir of directions) {
          const testPos = new THREE.Vector3(camera.position.x + dir.x * dist, targetY, camera.position.z + dir.z * dist);
          if (isSafe(testPos)) {
            targetPos = testPos;
            foundSafe = true;
            break;
          }
        }
      }
    }

    RuneEffects._animateDescent(camera, targetPos, hud);
  }

  static _animateDescent(camera, targetPos, hud) {
    const startPos = camera.position.clone();
    const duration = EFFECT_DURATIONS.FLIGHT.DESCENT * 1000;
    const startTime = Date.now();

    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      camera.position.lerpVectors(startPos, targetPos, progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        hud?.showMessage("Flight fades.");
      }
    }
    animate();
  }

  static rune_blink(player, scene, hud) {
    const obj = player.controls.object;
    const direction = new THREE.Vector3();
    player.controls.getDirection(direction);
    direction.normalize();

    const raycaster = new THREE.Raycaster(obj.position.clone(), direction);
    const obstacles = [];
    scene.traverse(obj => {
      if (obj.userData?.isObstacle) obstacles.push(obj);
    });

    const intersections = raycaster.intersectObjects(obstacles, true);
    let blinkDistance = VISUAL_CONFIG.BLINK_DISTANCE;

    if (intersections.length > 0) {
      blinkDistance = Math.max(0, intersections[0].distance - VISUAL_CONFIG.BLINK_BUFFER);
    }

    if (blinkDistance <= 0) {
      hud?.showMessage("Blink blocked! Too close to obstacle.");
      return;
    }

    const newPos = obj.position.clone().add(direction.multiplyScalar(blinkDistance));
    newPos.y = Math.max(newPos.y, VISUAL_CONFIG.MIN_FLOOR_HEIGHT);

    RuneEffects._animateBlink(obj, newPos, hud);
  }

  static _animateBlink(obj, newPos, hud) {
    obj.userData._blinkProgress = 0;
    obj.userData._blinkCooldown = 0;

    animationSystem.addAnimation(delta => {
      obj.userData._blinkProgress += delta;
      const progress = Math.min(obj.userData._blinkProgress / EFFECT_DURATIONS.BLINK.TELEPORT, 1);
      obj.scale.setScalar(1 - 0.9 * progress);

      if (progress >= 1) {
        obj.position.copy(newPos);
        obj.userData._blinkProgress = 0;

        animationSystem.addAnimation(delta2 => {
          obj.userData._blinkCooldown += delta2;
          const cooldownProgress = Math.min(obj.userData._blinkCooldown / EFFECT_DURATIONS.BLINK.COOLDOWN, 1);
          obj.scale.setScalar(0.1 + 0.9 * cooldownProgress);

          if (cooldownProgress >= 1) {
            obj.userData._blinkCooldown = 0;
            hud?.showMessage("You blink forward through space.");
            return false;
          }
          return true;
        });
        return false;
      }
      return true;
    });
  }

  static rune_strength(player, scene, hud) {
    player.canBreakWalls = true;
    hud?.showMessage("You feel powerful... walls can be broken!");
    setTimeout(() => {
      player.canBreakWalls = false;
      hud?.showMessage("Your strength fades.");
    }, EFFECT_DURATIONS.STRENGTH);
  }

  static rune_speed(player, scene, hud) {
    player.setMovementSpeed(2);
    hud?.showMessage("You feel a burst of speed!");
    setTimeout(() => {
      player.setMovementSpeed(1);
      hud?.showMessage("Speed fades.");
    }, EFFECT_DURATIONS.SPEED);
  }

  static rune_vision(player, scene, hud) {
    const overlay = RuneEffects._createVisionOverlay();
    document.body.appendChild(overlay);

    const originalMaterials = new Map();

    const xrayTargets = [];
    scene.traverse(obj => {
      if (obj.userData?.isTreasure) {
        xrayTargets.push({ obj, color: 0xffff00 });
      }
    });

    const exitDoor = scene.getObjectByName("exit_door");
    if (exitDoor) {
      xrayTargets.push({ obj: exitDoor, color: 0x42a5f5 });
    }

    scene.traverse(obj => {
      if (obj.userData?.breakable || obj.userData?.passThrough) {
        xrayTargets.push({ obj, color: 0x999999 });
      }
    });

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

    RuneEffects._animateVisionOverlay(overlay, hud);

    setTimeout(() => {
      xrayTargets.forEach(({ obj }) => {
        if (originalMaterials.has(obj)) {
          obj.material.dispose?.();
          obj.material = originalMaterials.get(obj);
        }
      });

      if (overlay.parentElement) document.body.removeChild(overlay);
      hud?.showMessage("The vision fades...");
    }, EFFECT_DURATIONS.VISION);
  }

  static _createVisionOverlay() {
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 80%)',
      opacity: '0',
      zIndex: '9999',
      mixBlendMode: 'screen',
      transition: 'background-size 0.5s ease',
    });
    return overlay;
  }

  static _animateVisionOverlay(overlay, hud) {
    AnimationSystem.animatePosition(overlay, {
      from: 0,
      to: 1,
      duration: 0.5,
      onUpdate: val => {
        overlay.style.opacity = val;
        const size = 100 + val * 50;
        overlay.style.backgroundSize = `${size}% ${size}%`;
      }
    });
    hud?.showMessage("Your eyes glow with insight...");
  }
}
