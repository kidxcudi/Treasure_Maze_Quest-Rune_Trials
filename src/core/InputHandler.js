export class InputHandler {
  constructor(interactionManager, player) {
    this.interactionManager = interactionManager;
    this.player = player;

    this.keyStates = {};

    this.setupListeners();
  }

  setupListeners() {
    document.addEventListener('keydown', (event) => {
      this.keyStates[event.code] = true;

      switch (event.code) {
        case 'KeyR':
          this.interactionManager.useRune();
          break;

        // You can add other key-based triggers here
        // case 'KeyE': this.handleInteract(); break;
      }
    });

    document.addEventListener('keyup', (event) => {
      this.keyStates[event.code] = false;
    });
  }
}