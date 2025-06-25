export class Tooltip {
  constructor() {
    this.el = document.createElement('div');
    this.el.id = 'tooltip';
    this.el.style.position = 'absolute';
    this.el.style.bottom = '10px';
    this.el.style.left = '50%';
    this.el.style.transform = 'translateX(-50%)';
    this.el.style.background = '#333';
    this.el.style.color = '#fff';
    this.el.style.padding = '8px 16px';
    this.el.style.borderRadius = '6px';
    this.el.style.fontSize = '14px';
    this.el.style.opacity = 0;
    this.el.style.transition = 'opacity 0.3s ease';
    this.el.style.zIndex = 20;
    document.body.appendChild(this.el);
  }

  show(text, duration = 3000) {
    this.el.textContent = text;
    this.el.style.opacity = 1;
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => this.hide(), duration);
  }

  hide() {
    this.el.style.opacity = 0;
  }
}
