import { HUD } from './HUD.js';
import { Tooltip } from './Tooltip.js';
import { StartScreen } from './StartScreen.js';
import { EndScreen } from './EndScreen.js';

class UIManager {
  constructor() {
    this.hud = new HUD();
    this.tooltip = new Tooltip();
    this.startScreen = new StartScreen();
    this.endScreen = new EndScreen();
  }

  showTooltip(text) {
    this.tooltip.show(text);
  }

  hideTooltip() {
    this.tooltip.hide();
  }

  updateHUD(data) {
    this.hud.update(data);
  }

  showStart() {
    this.startScreen.show();
  }

  hideStart() {
    this.startScreen.hide();
  }

  showEnd(score, time) {
    this.endScreen.show(score, time);
  }

  hideEnd() {
    this.endScreen.hide();
  }
}

export const uiManager = new UIManager();
