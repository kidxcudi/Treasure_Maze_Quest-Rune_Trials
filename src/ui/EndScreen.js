// src/ui/EndScreen.js

export class EndScreen {
  constructor() {
    this.container = document.createElement("div");
    this.container.id = "end-screen";
    this.container.style.cssText = `
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.85);
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      z-index: 9999;
      display: none;
    `;

    this.message = document.createElement("div");
    this.button = document.createElement("button");

    this.button.innerText = "Play Again";
    this.button.style.marginTop = "20px";
    this.button.onclick = () => window.location.reload();

    this.container.appendChild(this.message);
    this.container.appendChild(this.button);
    document.body.appendChild(this.container);
  }

  showResult(messageText) {
    this.message.innerText = messageText;
    this.container.style.display = "flex";
  }
}
