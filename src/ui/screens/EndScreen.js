// src/ui/EndScreen.js

export class EndScreen {
  constructor() {
    this.container = this._createContainer();
    this.message = this._createMessageElement();
    this.playtime = this._createPlaytimeElement();
    this.button = this._createButton();
    
    this._buildLayout();
    document.body.appendChild(this.container);
  }

  _createContainer() {
    const container = document.createElement("div");
    container.id = "end-screen";
    Object.assign(container.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.9)",
      color: "white",
      display: "none",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: "9999",
      fontFamily: "'Arial', sans-serif",
      backdropFilter: "blur(5px)",
      transition: "opacity 0.5s ease"
    });
    return container;
  }

  _createMessageElement() {
    const el = document.createElement("div");
    Object.assign(el.style, {
      fontSize: "3rem",
      fontWeight: "bold",
      marginBottom: "1rem",
      textAlign: "center",
      textShadow: "0 2px 4px rgba(0,0,0,0.5)"
    });
    return el;
  }

  _createPlaytimeElement() {
    const el = document.createElement("div");
    Object.assign(el.style, {
      fontSize: "1.5rem",
      marginBottom: "2rem",
      opacity: "0.8",
      fontFamily: "monospace"
    });
    return el;
  }

  _createButton() {
    const button = document.createElement("button");
    Object.assign(button.style, {
      padding: "12px 24px",
      fontSize: "1.2rem",
      fontWeight: "bold",
      backgroundColor: "#4CAF50",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      marginTop: "20px",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
    });
    
    button.innerText = "Play Again";
    button.onmouseenter = () => button.style.transform = "scale(1.05)";
    button.onmouseleave = () => button.style.transform = "scale(1)";
    button.onclick = () => window.location.reload();
    
    return button;
  }

  _buildLayout() {
    this.container.appendChild(this.message);
    this.container.appendChild(this.playtime);
    this.container.appendChild(this.button);
  }

  showResult(messageText, playtimeSeconds) {
    this.message.innerText = messageText;
    this._updatePlaytimeDisplay(playtimeSeconds);
    this.container.style.display = "flex";
    
    // Fade-in animation
    setTimeout(() => {
      this.container.style.opacity = "1";
    }, 10);
  }

  _updatePlaytimeDisplay(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    let timeString = "";
    if (hours > 0) timeString += `${hours}h `;
    if (minutes > 0 || hours > 0) timeString += `${minutes}m `;
    timeString += `${secs}s`;
    
    this.playtime.innerText = `Playtime: ${timeString}`;
  }

  hide() {
    this.container.style.opacity = "0";
    setTimeout(() => {
      this.container.style.display = "none";
    }, 500); // Match transition duration
  }
}