// src/ui/animation.js

// --- CSS-based simple animations with optional onComplete callbacks ---

/**
 * Fade in an element using CSS transitions.
 * @param {HTMLElement} element 
 * @param {number} duration Duration in ms
 * @param {() => void} [onComplete] Optional callback after animation ends
 */
export function fadeIn(element, duration = 1000, onComplete) {
  element.style.opacity = 0;
  element.style.transition = `opacity ${duration}ms ease`;
  element.style.display = 'block';

  const handleTransitionEnd = (e) => {
    if (e.propertyName === 'opacity') {
      element.removeEventListener('transitionend', handleTransitionEnd);
      if (onComplete) onComplete();
    }
  };

  element.addEventListener('transitionend', handleTransitionEnd);
  requestAnimationFrame(() => {
    element.style.opacity = 1;
  });
}

/**
 * Zoom in an element from a smaller scale using CSS transitions.
 * @param {HTMLElement} element 
 * @param {number} duration Duration in ms
 * @param {number} scaleFrom Initial scale
 * @param {() => void} [onComplete] Optional callback after animation ends
 */
export function zoomIn(element, duration = 800, scaleFrom = 0.8, onComplete) {
  element.style.transform = `scale(${scaleFrom})`;
  element.style.transition = `transform ${duration}ms ease`;
  element.style.display = 'block';

  const handleTransitionEnd = (e) => {
    if (e.propertyName === 'transform') {
      element.removeEventListener('transitionend', handleTransitionEnd);
      if (onComplete) onComplete();
    }
  };

  element.addEventListener('transitionend', handleTransitionEnd);
  requestAnimationFrame(() => {
    element.style.transform = 'scale(1)';
  });
}


// --- Frame-driven animation system ---

const animations = new Set();

/**
 * Registers a per-frame animation function.
 * @param {(delta: number) => void} fn
 */
export function addAnimation(fn) {
  animations.add(fn);
}

/**
 * Removes a previously registered animation function.
 * @param {(delta: number) => void} fn
 */
export function removeAnimation(fn) {
  animations.delete(fn);
}

/**
 * Called every frame from the main loop.
 * @param {number} delta Time in seconds since last frame
 */
export function updateAnimations(delta) {
  animations.forEach(fn => fn(delta));
}


// --- Tween utility ---

/**
 * Tween a property over time using linear interpolation.
 * @param {object} options
 * @param {number} options.duration Duration in seconds
 * @param {number} [options.from=0]
 * @param {number} [options.to=1]
 * @param {(value:number) => void} options.onUpdate
 * @param {() => void} [options.onComplete]
 * @param {(t:number) => number} [options.ease] Easing function, default linear
 * @returns {() => void} The animation function (for potential removal)
 */
export function createTween({
  duration,
  from = 0,
  to = 1,
  onUpdate,
  onComplete,
  ease = t => t, // Linear easing by default
}) {
  let elapsed = 0;

  const animate = (delta) => {
    elapsed += delta;
    let t = Math.min(elapsed / duration, 1);
    onUpdate(from + (to - from) * ease(t));

    if (t >= 1) {
      removeAnimation(animate);
      if (onComplete) onComplete();
    }
  };

  addAnimation(animate);
  return animate; // Return so it can be cancelled if needed
}
