// src/ui/Tooltip.js

// CSS Constants
const TOOLTIP_STYLES = {
  BASE: {
    position: 'fixed',
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    opacity: '0',
    transition: 'opacity 0.3s ease, transform 0.2s ease',
    zIndex: '1000',
    maxWidth: '300px',
    textAlign: 'center',
    pointerEvents: 'none',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
    backdropFilter: 'blur(4px)',
    lineHeight: '1.4',
    transform: 'translate(-50%, 10px)'
  },
  TOP: {
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)'
  },
  WORLD: {
    transform: 'translate(-50%, -100%)'
  },
  VISIBLE: {
    opacity: '1',
    transform: 'translate(-50%, 0)'
  }
};

export class Tooltip {
  constructor() {
    this.topEl = this._createTooltipElement('top');
    this.worldEl = this._createTooltipElement('world');
    this.topTimeout = null;
    this.worldTimeout = null;
    this.worldVisible = false;
    this._applyStyles();
  }

  _createTooltipElement(type) {
    const el = document.createElement('div');
    el.id = `tooltip-${type}`;
    el.className = 'game-tooltip';
    Object.assign(el.style, TOOLTIP_STYLES.BASE);
    document.body.appendChild(el);
    return el;
  }

  _applyStyles() {
    Object.assign(this.topEl.style, TOOLTIP_STYLES.TOP);
    Object.assign(this.worldEl.style, TOOLTIP_STYLES.WORLD);
  }

  showTop(text, duration = 3000) {
    this.topEl.textContent = text;
    Object.assign(this.topEl.style, TOOLTIP_STYLES.VISIBLE);
    clearTimeout(this.topTimeout);
    
    if (duration > 0) {
      this.topTimeout = setTimeout(() => this.hideTop(), duration);
    }
  }

  hideTop() {
    this.topEl.style.opacity = '0';
    this.topEl.style.transform = `${TOOLTIP_STYLES.TOP.transform} translateY(10px)`;
  }

  showWorld(text, screenPos, duration = 2000) {
    this.worldEl.textContent = text;
    Object.assign(this.worldEl.style, TOOLTIP_STYLES.VISIBLE);
    this.setWorldPosition(screenPos);
    clearTimeout(this.worldTimeout);
    
    if (duration > 0) {
      this.worldTimeout = setTimeout(() => this.hideWorld(), duration);
    }
    this.worldVisible = true;
  }

  hideWorld() {
    this.worldEl.style.opacity = '0';
    this.worldEl.style.transform = `${TOOLTIP_STYLES.WORLD.transform} translateY(10px)`;
    this.worldVisible = false;
  }

  setWorldPosition(screenPos) {
    if (!this.worldVisible) return;
    this.worldEl.style.left = `${screenPos.x}px`;
    this.worldEl.style.top = `${screenPos.y}px`;
  }

  updateWorldPosition(screenPos) {
    if (this.worldVisible) {
      this.setWorldPosition(screenPos);
    }
  }

  dispose() {
    clearTimeout(this.topTimeout);
    clearTimeout(this.worldTimeout);
    if (this.topEl.parentNode) document.body.removeChild(this.topEl);
    if (this.worldEl.parentNode) document.body.removeChild(this.worldEl);
  }
}