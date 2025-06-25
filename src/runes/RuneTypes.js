// src/runes/RuneTypes.js

export const RuneTypes = {
  // === Real Runes ===
  rune_flight: {
    label: "Rune of Flight",
    icon: "🕊️",
    color: "#8a2be2",
    description: "Float above obstacles. Great for crossing pits.",
  },

  rune_blink: {
    label: "Rune of Blink",
    icon: "⚡",
    color: "#00bcd4",
    description: "Teleport a short distance through walls or barriers.",
  },

  rune_strength: {
    label: "Rune of Strength",
    icon: "🔨",
    color: "#e57373",
    description: "Break weak or marked walls to reveal secret paths.",
  },

  rune_speed: {
    label: "Rune of Speed",
    icon: "🏃‍♂️",
    color: "#fbc02d",
    description: "Sprint for 4 seconds. Use to escape traps or explore faster.",
  },

  rune_vision: {
    label: "Rune of Vision",
    icon: "🔍",
    color: "#4caf50",
    description: "Reveal hidden treasures and secret objects briefly.",
  },

  // === Fake/Trap Runes ===
  fake_confusion: {
    label: "Confusion Rune",
    icon: "🔄",
    color: "#ff7043",
    description: "Inverts controls. You feel disoriented.",
    clue: "Flickers unnaturally.",
  },

  fake_collapse: {
    label: "Collapse Rune",
    icon: "💥",
    color: "#a1887f",
    description: "Triggers falling debris in front of you.",
    clue: "The air feels unstable nearby.",
  },

  fake_silence: {
    label: "Silence Rune",
    icon: "🔇",
    color: "#90a4ae",
    description: "Disables UI and audio for a few seconds.",
    clue: "It glitches slightly.",
  },
};
