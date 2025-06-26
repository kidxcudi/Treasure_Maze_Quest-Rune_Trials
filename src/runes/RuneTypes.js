export const RuneTypes = {
  // === Real Runes (can have trap variants) ===
  rune_flight: {
    label: "Rune of Flight",
    icon: "🪽",
    color: "#8a2be2",
    description: "Float above obstacles. Great for crossing pits.",
    isTrap: false,
    fakeVariant: "rune_confusion",
  },

  rune_blink: {
    label: "Rune of Blink",
    icon: "⚡",
    color: "#00bcd4",
    description: "Teleport a short distance through walls or barriers.",
    isTrap: false,
    fakeVariant: "rune_void",
  },

  rune_strength: {
    label: "Rune of Strength",
    icon: "🔨",
    color: "#e57373",
    description: "Break weak or marked walls to reveal secret paths.",
    isTrap: false,
    fakeVariant: "rune_pathblock",
  },

  rune_speed: {
    label: "Rune of Speed",
    icon: "🏃‍♂️",
    color: "#fbc02d",
    description: "Sprint for 4 seconds. Use to escape traps or explore faster.",
    isTrap: false,
    fakeVariant: "rune_gravity",
  },

  rune_vision: {
    label: "Rune of Vision",
    icon: "🔍",
    color: "#4caf50",
    description: "Reveal hidden treasures and secret objects briefly.",
    isTrap: false,
    fakeVariant: "rune_silence",
  },

  // === Fake/Trap Runes ===
  rune_confusion: {
    label: "Confusion Rune",
    icon: "🔄",
    color: "#ff7043",
    description: "Inverts movement for next 10 steps.",
    clue: "Flickers unnaturally.",
    isTrap: true,
  },

  rune_pathblock: {
    label: "Rune of Binding",
    icon: "⛔",
    color: "#8d6e63",
    description: "Blocks the nearest path for 10 player steps.",
    clue: "The ground trembles faintly nearby.",
    isTrap: true,
  },

  rune_silence: {
    label: "Silence Rune",
    icon: "🔇",
    color: "#90a4ae",
    description: "Disables UI and audio for 10 steps.",
    clue: "It glitches slightly.",
    isTrap: true,
  },

  rune_gravity: {
    label: "Rune of Gravity",
    icon: "⬇️",
    color: "#5d4037",
    description: "Slams you down and stuns movement for 5 steps.",
    clue: "It pulses with a heavy weight.",
    isTrap: true,
  },

  rune_void: {
    label: "Rune of Void",
    icon: "🕳️",
    color: "#311b92",
    description: "Blinds you (hide maze) for 7 steps.",
    clue: "A shadowy whirlpool spins inside the rune.",
    isTrap: true,
  },
};