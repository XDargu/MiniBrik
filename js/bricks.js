const BRICKS = {
  0: { name: "2x4", w:2, d:4, type:"box" },
  1: { name: "2x3", w:2, d:3, type:"box" },
  2: { name: "2x2", w:2, d:2, type:"box" },
  3: { name: "2x1", w:2, d:1, type:"box" },
  4: { name: "1x4", w:1, d:4, type:"box" },
  5: { name: "1x3", w:1, d:3, type:"box" },
  6: { name: "1x1", w:1, d:1, type:"box" },

  7: { name: "1x2 Tile", w:1, d:2, type:"tile" },
  8: { name: "1x1 Tile", w:1, d:1, type:"tile" },

  9: { name: "2x2 Round", w:2, d:2, type:"cylinder" },
  10: { name: "1x1 Round", w:1, d:1, type:"cylinder", hollowStud: true },

  
  11:{ name: "1x1 Cone", w:1, d:1, type:"cone", hollowStud: true },
};

const COLORS = [
  // basic
  0xff0000, // Red
  0x0000ff, // Blue
  0x00ff00, // Green
  0xffff00, // Yellow
  0xffffff, // White

  // LEGO "modern architectural / modular" palette (approx BrickLink)
  0xa0bc9a, // Sand Green
  0xa0a5a9, // Light Bluish Gray
  0x6c6e68, // Dark Bluish Gray
  0xd7c59a, // Dark Tan
  0xf2d2a9, // Nougat
  0xc7a57b, // Medium Nougat
  0x6b8ba4, // Sand Blue
  0x607848, // Olive Green
  0x3a3a3a, // Black
  0xffc94a  // Bright Light Orange
];

function colorToIndex(hex) {
  return COLORS.indexOf(hex);
}

function indexToColor(i) {
  return COLORS[i] ?? COLORS[0];
}