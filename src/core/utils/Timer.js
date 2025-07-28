// src/core/Timer.js

export class Timer {
  constructor(onEnd, hud) {
    this.hud = hud;
    this.onEnd = onEnd;
    this.remaining = 0;
    this.intervalId = null;
  }

  start(seconds) {
    this.remaining = seconds;
    this.stop();

    this.intervalId = setInterval(() => {
      this.remaining--;
      this.hud.updateTimer(this.remaining);

      if (this.remaining <= 0) {
        this.stop();
        this.onEnd?.();
      }
    }, 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
