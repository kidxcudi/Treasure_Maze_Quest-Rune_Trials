export const RuneTypes = {
  // === Real Runes (can have trap variants) ===
  rune_flight: {
    label: "Rune of Flight",
    icon: "🪽",
    color: "#8a2be2",
    description: "Float above obstacles. Great for crossing pits and barriers.",
  },

  rune_blink: {
    label: "Rune of Blink",
    icon: "⚡",
    color: "#00bcd4",
    description: "Teleport a short distance to visible places.",
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
    description: "Sprint for 4 seconds. Use to explore faster.",
  },

  rune_vision: {
    label: "Rune of Vision",
    icon: "🔍",
    color: "#4caf50",
    description: "Reveal hidden treasures and secret objects briefly.",
  },

  // === Fake/Trap Runes ===
  rune_confusion: {
    label: "Confusion Rune",
    icon: "🔄",
    color: "#ff7043",
    description: "Inverts movement for next some steps.",
    clue: "Flickers unnaturally.",
    isTrap: true,
  },

  rune_pathblock: {
    label: "Rune of Binding",
    icon: "⛔",
    color: "#8d6e63",
    description: "Blocks the nearest path for some player steps.",
    clue: "The ground trembles faintly nearby.",
    isTrap: true,
  },

  rune_silence: {
    label: "Silence Rune",
    icon: "🔇",
    color: "#90a4ae",
    description: "Disables UI and audio for some steps.",
    clue: "It glitches slightly.",
    isTrap: true,
  },

  rune_gravity: {
    label: "Rune of Gravity",
    icon: "⬇️",
    color: "#5d4037",
    description: "Slams you down and stuns movement for some steps.",
    clue: "It pulses with a heavy weight.",
    isTrap: true,
  },

  rune_void: {
    label: "Rune of Void",
    icon: "🕳️",
    color: "#311b92",
    description: "Blinds you (hide maze) for some steps.",
    clue: "A shadowy whirlpool spins inside the rune.",
    isTrap: true,
  },
};