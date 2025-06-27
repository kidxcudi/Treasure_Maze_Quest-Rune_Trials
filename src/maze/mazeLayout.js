export const maze1 = {
  tileSize: 3,
  layout: [
    "#############",
    "#   #   r   #",
    "# # # ##### #",
    "#S#     #   #",
    "### ### # ###",
    "#     # #   #",
    "# ##### ### #",
    "#   T #   t #",
    "# ###R##### #",
    "# e #     E #",
    "#############",
  ],
  objects: {
    playerStart: { x: 1, z: 3 },
    exit: { x: 9, z: 9 },
    exitMechanism: { x: 3, z: 9 },
    runes: [
      { x: 5, z: 3, type: "rune_flight" },
      { x: 5, z: 8, type: "rune_blink" },
      { x: 5, z: 2, type: "rune_strength" },
      { x: 2, z: 5, type: "rune_speed" },
      { x: 6, z: 3, type: "rune_vision" },

      { x: 5, z: 9, type: "rune_blink", isTrap: true },
      { x: 7, z: 3, type: "rune_strength", isTrap: true }
    ],
    treasures: [
      { x: 1, z: 1 },
      { x: 3, z: 3 },
      { x: 9, z: 5 },
    ],
    easterEggs: [
      { x: 3, z: 2, type: "pass_through" },
      { x: 8, z: 7, type: "breakable" },
      { x: 4, z: 5, type: "low_wall" },
      { x: 5, z: 2, type: "quicksand" }
    ],
  },
};

export const maze123 = {
  tileSize: 3,
  layout: [
    "#####################",
    "#   # r #     #   # #",
    "# # ### # ### # # # #",
    "# #         # # # # #",
    "# ### ##### # # # # #",
    "#     #   t # #   # #",
    "##### # ##### ### # #",
    "#   # #   R   #   # #",
    "# # ### # ### # ### #",
    "# #     #   # #     #",
    "# # ##### # # ##### #",
    "# #     # # #     # #",
    "# ##### # # ### # # #",
    "#       #       # # #",
    "### ### ####### # # #",
    "#   # e       # #   #",
    "# # ######### # ### #",
    "# #         S #   E #",
    "#####################"
  ],
  objects: {
    playerStart: { x: 15, z: 17 },
    exit: { x: 17, z: 17 },
    exitMechanism: { x: 5, z: 15 },
    runes: [
      // Core progression runes (required)
      { x: 5, z: 1, type: "rune_strength"}, // For breakable walls
      { x: 9, z: 7, type: "rune_flight"},   // For low walls
      
      // Optional utility runes
      { x: 15, z: 1, type: "rune_blink" },  // Shortcut alternative
      { x: 7, z: 5, type: "rune_vision" },  // Reveals hidden path
      { x: 13, z: 3, type: "rune_speed" },  // Bypass quicksand
      
      // Fake runes (traps)
      { x: 11, z: 15, type: "rune_blink", isTrap: true },
      { x: 3, z: 9, type: "rune_strength", isTrap: true }
    ],
    treasures: [
      { x: 7, z: 5 },  // Hidden behind vision wall
      { x: 9, z: 13}, // Behind breakable wall
      { x: 17, z: 3}   // On elevated platform
    ],
    easterEggs: [
      { x: 8, z: 8, type: "breakable"},
      { x: 10, z: 10, type: "low_wall"},
      { x: 12, z: 12, type: "pass_through"},
      { x: 14, z: 14, type: "quicksand"}
    ]
  }
};

export const maze12 = {
  tileSize: 3,
  layout: [
    "#####################",
    "#   r     #   #   E#",  // r=strength(4,1), E=exit(17,1)
    "# ### ### # ### ###",
    "#     #   #       #",
    "##### # ###########",
    "# t   #   #     e #",  // t=treasure(2,5), e=mechanism(15,5)
    "# ##### # # ##### #",
    "#       # #   R   #",  // R=flight(11,7)
    "### ##### ### #####",
    "#   #       #     #",
    "# # # ####### ### #",
    "# # #   t   #   # #",  // t=treasure(7,11)
    "# # #### # ### # #",
    "# #     # #     # #",
    "# ##### # ##### # #",
    "#       ≈       # #",  // ≈=quicksand(7,15)
    "##### ####### #####",
    "#   #       #   S#",  // S=start(15,17)
    "# # ####### # # #",
    "# #     T   # # #",  // T=treasure(9,19)
    "#####################"
  ],
  objects: {
    playerStart: { x: 15, z: 17 },
    exit: { x: 17, z: 1 },
    exitMechanism: { x: 15, z: 5 },
    runes: [
      // Required runes (2)
      { x: 4, z: 1, type: "rune_strength" }, // For breakable walls
      { x: 11, z: 7, type: "rune_flight"},  // For low walls
      
      // Optional runes (3)
      { x: 2, z: 13, type: "rune_blink" },  // Alternative path
      { x: 9, z: 5, type: "rune_vision" },  // Reveals hidden
      { x: 17, z: 13, type: "rune_speed" }, // For quicksand
      
      // Traps (2)
      { x: 7, z: 3, type: "rune_blink", isTrap: true },
      { x: 13, z: 9, type: "rune_vision", isTrap: true }
    ],
    treasures: [
      { x: 2, z: 5 },              // Early easy treasure
      { x: 7, z: 11 },   // Behind breakable wall
      { x: 9, z: 19}      // On high platform
    ],
    easterEggs: [
      // Positioned in open spaces (not overlapping normal walls)
      { x: 6, z: 5, type: "breakable" },
      { x: 11, z: 15, type: "low_wall"},
      { x: 5, z: 9, type: "pass_through" },
      { x: 7, z: 15, type: "quicksand" }
    ]
  }
};

