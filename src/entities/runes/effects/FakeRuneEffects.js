import { createTween, addAnimation, removeAnimation } from '../core/animation.js';
import { animationSystem, AnimationSystem } from '../../../core/utils/animation.js';
// Constants
const EFFECT_DURATIONS = {
  CONFUSION: 10,
  PATHBLOCK: 10,
  SILENCE: 10,
  GRAVITY: 5,
  VOID: 7
};

const VISUAL_CONFIG = {
  BLUR: {
    MAX: 5,
    DURATION: 0.5
  },
  SHAKE: {
    INTENSITY: 0.05,
    SPEED: 40,
    FADE: true
  },
  WALL: {
    SLIDE_DISTANCE: 5,
    SHIMMER_SPEED: 20,
    SHIMMER_INTENSITY: 0.5
  },
  GRAVITY: {
    BOUNCE_HEIGHT: 0.5,
    SLAM_DURATION: 0.3,
    SHAKE_INTENSITY: 0.05
  },
  VOID: {
    OPACITY: 0.95,
    PULSE_SPEED: 8,
    PULSE_RANGE: 0.1
  }
};

export class FakeRuneEffects {
  static rune_confusion(player, gameState, hud) {
    hud?.showMessage("Your thoughts scramble... Controls reversed!");
    player.invertControls(EFFECT_DURATIONS.CONFUSION);

    this._applyBlurEffect();
    this._applyCameraShake(player, EFFECT_DURATIONS.CONFUSION);

    player.applyEffectDuration("confusion", EFFECT_DURATIONS.CONFUSION, () => {
      gameState.equippedRune = null;
      hud?.updateRuneDisplay(null);
    });
  }

  static rune_pathblock(player, gameState, hud, maze) {
    hud?.showMessage("The walls shift... A path is blocked.");

    const wallsToBlock = maze.getWallsToBlock?.() || [];
    wallsToBlock.forEach(wall => this._animateBlockingWall(wall));

    maze.blockAllPaths(EFFECT_DURATIONS.PATHBLOCK);

    player.applyEffectDuration("pathblock", EFFECT_DURATIONS.PATHBLOCK, () => {
      this._resetBlockingWalls(wallsToBlock);
      gameState.equippedRune = null;
      hud?.updateRuneDisplay(null);
    });
  }

  static rune_silence(player, gameState, hud, uiManager) {
    this._fadeOutUI(hud);
    // uiManager?.disableAudio();

    player.applyEffectDuration("silence", EFFECT_DURATIONS.SILENCE, () => {
      this._fadeInUI(hud);
      // uiManager?.enableAudio();
      hud?.showMessage("Silence fades...");
      gameState.equippedRune = null;
      hud?.updateRuneDisplay(null);
    });
  }

  static rune_gravity(player, gameState, hud) {
    hud?.showMessage("A heavy force slams you to the ground!");
    this._applyGravityEffect(player);
    player.stunMovement(EFFECT_DURATIONS.GRAVITY);

    player.applyEffectDuration("gravity_stun", EFFECT_DURATIONS.GRAVITY, () => {
      gameState.equippedRune = null;
      hud?.updateRuneDisplay(null);
    });
  }

  static rune_void(player, gameState, hud, scene) {
    hud?.showMessage("A void swallows your vision!");
    const affectedMeshes = this._hideSceneObjects(scene);
    this._applyVoidEffect(player);

    player.applyEffectDuration("vision_blind", EFFECT_DURATIONS.VOID, () => {
      this._restoreSceneObjects(affectedMeshes);
      this._removeVoidEffect(player);
      hud?.showMessage("Your vision returns.");
      gameState.equippedRune = null;
      hud?.updateRuneDisplay(null);
    });
  }

  // ===== Helper Methods =====
  static _applyBlurEffect() {
    const blurOverlay = document.getElementById('blur-overlay');
    if (!blurOverlay) return;

    createTween({
      duration: VISUAL_CONFIG.BLUR.DURATION,
      from: 0,
      to: VISUAL_CONFIG.BLUR.MAX,
      onUpdate: val => {
        blurOverlay.style.backdropFilter = `blur(${val}px)`;
      }
    });
  }

  static _applyCameraShake(player, duration) {
    const cam = player.controls.object;
    const originalPos = cam.position.clone();
    let elapsed = 0;

    const shake = (delta) => {
      elapsed += delta;
      if (elapsed > duration) {
        removeAnimation(shake);
        cam.position.copy(originalPos);
        this._removeBlurEffect();
        return;
      }

      const intensity = VISUAL_CONFIG.SHAKE.FADE 
        ? VISUAL_CONFIG.SHAKE.INTENSITY * (1 - elapsed / duration) 
        : VISUAL_CONFIG.SHAKE.INTENSITY;

      cam.position.set(
        originalPos.x + (Math.sin(elapsed * VISUAL_CONFIG.SHAKE.SPEED) * intensity),
        originalPos.y + (Math.cos(elapsed * VISUAL_CONFIG.SHAKE.SPEED * 0.875) * intensity),
        originalPos.z + (Math.sin(elapsed * VISUAL_CONFIG.SHAKE.SPEED * 1.25) * intensity)
      );
    };

    addAnimation(shake);
  }

  static _removeBlurEffect() {
    const blurOverlay = document.getElementById('blur-overlay');
    if (!blurOverlay) return;

    createTween({
      duration: VISUAL_CONFIG.BLUR.DURATION,
      from: parseFloat(blurOverlay.style.backdropFilter?.match(/\d+/)?.[0]) || VISUAL_CONFIG.BLUR.MAX,
      to: 0,
      onUpdate: val => {
        blurOverlay.style.backdropFilter = `blur(${val}px)`;
      }
    });
  }

  static _animateBlockingWall(wall) {
    wall.userData.isBlocked = true;
    const originalY = wall.position.y;
    wall.position.y = originalY - VISUAL_CONFIG.WALL.SLIDE_DISTANCE;

    createTween({
      duration: 1,
      from: wall.position.y,
      to: originalY,
      onUpdate: val => wall.position.y = val
    });

    if (wall.material) {
      let elapsed = 0;
      const shimmer = (delta) => {
        elapsed += delta;
        wall.material.emissiveIntensity = 
          VISUAL_CONFIG.WALL.SHIMMER_INTENSITY + 
          VISUAL_CONFIG.WALL.SHIMMER_INTENSITY * Math.sin(elapsed * VISUAL_CONFIG.WALL.SHIMMER_SPEED);
      };
      addAnimation(shimmer);
      wall.userData.shimmerAnim = shimmer;
    }
  }

  static _resetBlockingWalls(walls) {
    walls.forEach(wall => {
      createTween({
        duration: 1,
        from: wall.position.y,
        to: wall.position.y - VISUAL_CONFIG.WALL.SLIDE_DISTANCE,
        onUpdate: val => wall.position.y = val,
        onComplete: () => {
          wall.userData.isBlocked = false;
          if (wall.userData.shimmerAnim) {
            removeAnimation(wall.userData.shimmerAnim);
            wall.material.emissiveIntensity = 0;
          }
        }
      });
    });
  }

  static _fadeOutUI(hud) {
    if (!hud?.el) return;
    hud.el.style.transition = 'opacity 0.5s ease';
    hud.el.style.opacity = '0';
  }

  static _fadeInUI(hud) {
    if (!hud?.el) return;
    hud.el.style.opacity = '1';
  }

  static _applyGravityEffect(player) {
    const cam = player.controls.object;
    const originalPos = cam.position.clone();
    let elapsed = 0;
    let phase = 0;

    const slamAnim = (delta) => {
      elapsed += delta;
      
      if (phase === 0) {
        const t = Math.min(elapsed / VISUAL_CONFIG.GRAVITY.SLAM_DURATION, 1);
        cam.position.y = originalPos.y - VISUAL_CONFIG.GRAVITY.BOUNCE_HEIGHT * t;
        if (t === 1) {
          phase = 1;
          elapsed = 0;
        }
      } else if (phase === 1) {
        const t = Math.min(elapsed / VISUAL_CONFIG.GRAVITY.SLAM_DURATION, 1);
        cam.position.y = originalPos.y - VISUAL_CONFIG.GRAVITY.BOUNCE_HEIGHT + 
                         VISUAL_CONFIG.GRAVITY.BOUNCE_HEIGHT * t;
        if (t === 1) {
          phase = 2;
          elapsed = 0;
        }
      } else if (elapsed <= 1) {
        cam.position.set(
          originalPos.x + (Math.random() * 2 - 1) * VISUAL_CONFIG.GRAVITY.SHAKE_INTENSITY,
          originalPos.y,
          originalPos.z + (Math.random() * 2 - 1) * VISUAL_CONFIG.GRAVITY.SHAKE_INTENSITY
        );
      } else {
        cam.position.copy(originalPos);
        removeAnimation(slamAnim);
      }
    };

    addAnimation(slamAnim);
  }

  static _hideSceneObjects(scene) {
    const affectedMeshes = [];
    scene.traverse(obj => {
      if (obj.isMesh && obj.visible && !obj.userData.isFakeWall) {
        obj.visible = false;
        affectedMeshes.push(obj);
      }
    });
    return affectedMeshes;
  }

  static _applyVoidEffect(player) {
    const overlay = document.getElementById('vision-overlay');
    if (!overlay) return;

    overlay.style.opacity = '0';
    createTween({
      duration: 0.5,
      from: 0,
      to: VISUAL_CONFIG.VOID.OPACITY,
      onUpdate: val => (overlay.style.opacity = val)
    });

    let pulseElapsed = 0;
    const pulseAnim = (delta) => {
      pulseElapsed += delta;
      const pulse = VISUAL_CONFIG.VOID.OPACITY - 
                   VISUAL_CONFIG.VOID.PULSE_RANGE * 0.5 + 
                   VISUAL_CONFIG.VOID.PULSE_RANGE * Math.sin(pulseElapsed * VISUAL_CONFIG.VOID.PULSE_SPEED);
      overlay.style.opacity = pulse;
    };
    addAnimation(pulseAnim);
    player.userData._voidPulseAnim = pulseAnim;
  }

  static _restoreSceneObjects(meshes) {
    meshes.forEach(obj => (obj.visible = true));
  }

  static _removeVoidEffect(player) {
    const overlay = document.getElementById('vision-overlay');
    if (!overlay) return;

    createTween({
      duration: 0.5,
      from: parseFloat(overlay.style.opacity) || VISUAL_CONFIG.VOID.OPACITY,
      to: 0,
      onUpdate: val => (overlay.style.opacity = val),
      onComplete: () => {
        if (player.userData._voidPulseAnim) {
          removeAnimation(player.userData._voidPulseAnim);
          delete player.userData._voidPulseAnim;
        }
      }
    });
  }
}