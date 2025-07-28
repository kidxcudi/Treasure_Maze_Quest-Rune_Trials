// src/core/AnimationSystem.js
import * as THREE from 'three';

export class AnimationSystem {
  constructor() {
    this._animations = new Set(); // { id, fn }
    this._idCounter = 0;
  }

  /** Add a new animation callback */
  addAnimation(fn, id = null) {
    const animId = id ?? this._idCounter++;
    this._animations.add({ id: animId, fn });
    return animId;
  }

  /** Remove an animation by ID */
  removeAnimation(id) {
    for (const anim of this._animations) {
      if (anim.id === id) {
        this._animations.delete(anim);
        return true;
      }
    }
    return false;
  }

  /** Call every frame */
  update(delta) {
    for (const anim of this._animations) {
      anim.fn(delta);
    }
  }

  /** Dispose everything */
  dispose() {
    this._animations.clear();
  }

  /** Fade in/out element */
  static fadeElement(element, {
    from = 0, to = 1, duration = 300, easing = 'ease', display = 'block'
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
    transformFrom = '', transformTo = '',
    duration = 300, easing = 'ease'
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

  /** Animate 3D object position */
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
      const eased = easing(progress);

      object.position.copy(from.clone().add(delta.clone().multiplyScalar(eased)));
      onUpdate(object.position);

      if (progress < 1) requestAnimationFrame(update);
      else onComplete();
    }

    requestAnimationFrame(update);
  }

  /** Bounce idle effect */
  createIdleBounce(object, { amplitude = 0.05, speed = 2 }) {
    let time = 0;
    const baseY = object.position.y;

    return this.addAnimation((delta) => {
      time += delta;
      object.position.y = baseY + Math.sin(time * speed * Math.PI * 2) * amplitude;
    });
  }

  /** Pulse scale effect */
  createPulseEffect(object, {
    scaleFrom = 1,
    scaleTo = 1.2,
    duration = 0.5,
    repeat = Infinity
  }) {
    let cycleTime = 0;
    let reps = repeat;
    const original = object.scale.clone();

    const animId = this.addAnimation((delta) => {
      cycleTime += delta;
      if (cycleTime > duration) {
        if (reps === Infinity) {
          cycleTime = 0;
        } else if (--reps <= 0) {
          object.scale.copy(original);
          this.removeAnimation(animId);
          return;
        }
      }
      const t = cycleTime / duration;
      const scale = scaleFrom + (scaleTo - scaleFrom) * Math.sin(t * Math.PI);
      object.scale.copy(original).multiplyScalar(scale);
    });

    return animId;
  }

  /** Tween a numeric value */
  createTween({
    from = 0,
    to = 1,
    duration = 1,
    easing = t => t,
    onUpdate = () => {},
    onComplete = () => {}
  }) {
    let elapsed = 0;

    const animFn = (delta) => {
      elapsed += delta;
      const t = Math.min(elapsed / duration, 1);
      const eased = easing(t);
      onUpdate(from + (to - from) * eased);

      if (t >= 1) {
        onComplete?.();
        return false; // signal to stop
      }
      return true;
    };

    const wrapped = (delta) => {
      const result = animFn(delta);
      if (!result) this.removeAnimation(animId);
    };

    const animId = this.addAnimation(wrapped);
    return animId;
  }

  /** Screen effects */
  static screenEffect(type, duration = 1000) {
    const overlay = document.getElementById('effect-overlay') || this.createOverlay();
    switch (type) {
      case 'stun': return this.applyStunEffect(overlay, duration);
      case 'void': return this.applyVoidEffect(overlay, duration);
      case 'silence': return this.applySilenceEffect(duration);
      default:
        console.warn(`Unknown effect: ${type}`);
        return Promise.resolve();
    }
  }

  static createOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'effect-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 1000; opacity: 0;
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  static applyStunEffect(overlay, duration) {
    overlay.style.background = 'rgba(0, 0, 0, 0.6)';
    this.fadeElement(overlay, { to: 1, duration: 100 });
    const shakeIntensity = 1.5;

    const animId = animationSystem.addAnimation(() => {
      const x = Math.sin(performance.now() * 0.05) * shakeIntensity;
      const y = Math.cos(performance.now() * 0.06) * shakeIntensity;
      overlay.style.transform = `translate(${x}px, ${y}px)`;
    });

    return new Promise(resolve => {
      setTimeout(() => {
        animationSystem.removeAnimation(animId);
        overlay.style.transform = '';
        this.fadeElement(overlay, { to: 0, duration: 300 }).then(resolve);
      }, duration);
    });
  }

  static applyVoidEffect(overlay, duration) {
    overlay.style.background = 'radial-gradient(circle, black, transparent)';
    return this.fadeElement(overlay, { to: 0.8, duration });
  }

  static applySilenceEffect(duration) {
    return Promise.resolve(); // Extend as needed
  }
}

// Singleton instance
export const animationSystem = new AnimationSystem();
