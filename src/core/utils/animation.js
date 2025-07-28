// src/core/utils/AnimationSystem.js
import * as THREE from 'three';

export class AnimationSystem {
  constructor() {
    this.activeAnimations = new Set();
    this.animationId = 0;
  }

  /**
   * Core animation loop management
   */
  addAnimation(fn, id = null) {
    const animationId = id || this.animationId++;
    this.activeAnimations.add({ id: animationId, fn });
    return animationId;
  }

  removeAnimation(id) {
    for (const anim of this.activeAnimations) {
      if (anim.id === id) {
        this.activeAnimations.delete(anim);
        return true;
      }
    }
    return false;
  }

  update(deltaTime) {
    this.activeAnimations.forEach(({ fn }) => fn(deltaTime));
  }

  clearAll() {
    this.activeAnimations.clear();
  }

  /**
   * DOM Element Animations
   */
  static fadeElement(element, { 
    from = 0, 
    to = 1, 
    duration = 300, 
    easing = 'ease-out',
    display = 'block'
  }) {
    return new Promise(resolve => {
      element.style.opacity = from;
      element.style.display = display;
      element.style.transition = `opacity ${duration}ms ${easing}`;

      requestAnimationFrame(() => {
        element.style.opacity = to;
        setTimeout(resolve, duration);
      });
    });
  }

  static transformElement(element, {
    transformFrom = '',
    transformTo = '',
    duration = 300,
    easing = 'ease-out'
  }) {
    return new Promise(resolve => {
      element.style.transform = transformFrom;
      element.style.transition = `transform ${duration}ms ${easing}`;

      requestAnimationFrame(() => {
        element.style.transform = transformTo;
        setTimeout(resolve, duration);
      });
    });
  }

  /**
   * 3D Object Animations
   */
  static animatePosition(object, {
    from = object.position.clone(),
    to,
    duration = 1,
    easing = t => t,
    onUpdate = () => {},
    onComplete = () => {}
  }) {
    const startTime = performance.now();
    const delta = new THREE.Vector3().subVectors(to, from);

    function update(currentTime) {
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);

      object.position.copy(
        from.clone().add(delta.clone().multiplyScalar(easedProgress))
      );

      onUpdate(object.position);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        onComplete();
      }
    }

    requestAnimationFrame(update);
  }

  /**
   * Special Effects
   */
  static async screenEffect(type, duration = 1000) {
    const overlay = document.getElementById('effect-overlay') || 
      this.createEffectOverlay();

    switch (type) {
      case 'stun':
        return this.applyStunEffect(overlay, duration);
      case 'void':
        return this.applyVoidEffect(overlay, duration);
      case 'silence':
        return this.applySilenceEffect(duration);
      default:
        console.warn(`Unknown effect type: ${type}`);
    }
  }

  static createEffectOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'effect-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      z-index: 1000;
      opacity: 0;
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  static applyStunEffect(overlay, duration) {
    return new Promise(resolve => {
      overlay.style.background = 'rgba(0, 0, 0, 0.6)';
      overlay.style.transition = 'none';
      
      this.fadeElement(overlay, { to: 1, duration: 100 });

      const shakeId = this.addAnimation((delta) => {
        const intensity = 1.5;
        const x = Math.sin(performance.now() * 0.05) * intensity;
        const y = Math.cos(performance.now() * 0.06) * intensity;
        overlay.style.transform = `translate(${x}px, ${y}px)`;
      });

      setTimeout(() => {
        this.removeAnimation(shakeId);
        overlay.style.transform = '';
        this.fadeElement(overlay, { to: 0, duration: 500 })
          .then(resolve);
      }, duration);
    });
  }

  /**
   * Utility Animations
   */
  static createIdleBounce(object, {
    amplitude = 0.05,
    speed = 2,
    baseY = object.position.y
  }) {
    let time = 0;
    
    return this.addAnimation((delta) => {
      time += delta;
      object.position.y = baseY + 
        Math.sin(time * speed * Math.PI * 2) * amplitude;
    });
  }

  static createPulseEffect(object, {
    scaleFrom = 1,
    scaleTo = 1.2,
    duration = 0.5,
    repeat = Infinity
  }) {
    let cycleTime = 0;
    const originalScale = object.scale.clone();

    return this.addAnimation((delta) => {
      cycleTime += delta;
      if (cycleTime > duration) {
        if (repeat === Infinity) {
          cycleTime = 0;
        } else if (--repeat <= 0) {
          object.scale.copy(originalScale);
          return false; // Signal to remove animation
        }
      }

      const progress = cycleTime / duration;
      const pulseScale = scaleFrom + 
        (scaleTo - scaleFrom) * Math.sin(progress * Math.PI);
      
      object.scale.copy(originalScale).multiplyScalar(pulseScale);
      return true;
    });
  }
}

// Singleton instance for global access
export const animationSystem = new AnimationSystem();

// Helper for requestAnimationFrame integration
export function updateAnimationSystem(deltaTime) {
  animationSystem.update(deltaTime);
}