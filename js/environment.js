const LIGHT_PRESETS = {
  0: {
    name: "Bright day",
    background: 0x196c89,

    hemi: {
      sky: 0xb1e1ff,
      ground: 0xb97a20,
      intensity: 2,
    },

    dir: {
      color: 0xffffff,
      intensity: 2.2,
      position: [5, 10, 2],
      shadow: {
        enabled: true,
      },
    },

    renderer: {
      toneMapping: THREE.ACESFilmicToneMapping,
      exposure: 1.0,
      shadows: true,
    },
  },

  1: {
    name: "Sunset",
    background: 0xff8c42,

    hemi: {
      sky: 0xffb56b,
      ground: 0x5a2e0c,
      intensity: 1.2,
    },

    dir: {
      color: 0xff6a00,
      intensity: 2.5,
      position: [-18, 8, 3],
      shadow: {
        enabled: true,
      },
    },

    renderer: {
      toneMapping: THREE.ACESFilmicToneMapping,
      exposure: 1.2,
      shadows: true,
    },
  },

  2: {
    name: "Night",
    background: 0x0b1a2a,

    hemi: {
      sky: 0x1a2a44,
      ground: 0x000000,
      intensity: 0.4,
    },

    dir: {
      color: 0x9bbcff,
      intensity: 0.6,
      position: [3, 8, 2],
      shadow: {
        enabled: true,
      },
    },

    renderer: {
      toneMapping: THREE.ACESFilmicToneMapping,
      exposure: 0.45,
      shadows: true,
    },
  },

  3: {
    name: "Overcast",
    background: 0x9ea7ad,

    hemi: {
      sky: 0xd6dde2,
      ground: 0x8c8c8c,
      intensity: 1.5,
    },

    dir: {
      color: 0xffffff,
      intensity: 0.4,
      position: [0, 10, 0],
      shadow: {
        enabled: true,
      },
    },

    renderer: {
      toneMapping: THREE.ReinhardToneMapping,
      exposure: 1.1,
      shadows: true,
    },
  },

  4: {
    name: "Warm",
    background: 0x3a2b1a,

    hemi: {
      sky: 0xffe2b8,
      ground: 0x2a1a0f,
      intensity: 1.3,
    },

    dir: {
      color: 0xffc58f,
      intensity: 1.8,
      position: [2, 6, 2],
      shadow: {
        enabled: true,
      },
    },

    renderer: {
      toneMapping: THREE.ACESFilmicToneMapping,
      exposure: 0.9,
      shadows: true,
    },
  },
  5: {
    name: "Neon",
    background: 0x0a0a1a,

    hemi: {
      sky: 0x2a2aff,
      ground: 0x000000,
      intensity: 0.5,
    },

    dir: {
      color: 0xff00cc,
      intensity: 1.5,
      position: [2, 5, 2],
      shadow: {
        enabled: true,
      },
    },

    renderer: {
      toneMapping: THREE.ACESFilmicToneMapping,
      exposure: 1.3,
      shadows: true,
    },
  },

  7: {
    name: "Catalog",
    background: 0xf2f2f2,

    hemi: {
      sky: 0xffffff,
      ground: 0xe6e6e6,
      intensity: 1.8,
    },

    dir: {
      color: 0xffffff,
      intensity: 1.6,
      position: [3, 7, 4],
      shadow: {
        enabled: true,
      },
    },

    renderer: {
      toneMapping: THREE.ACESFilmicToneMapping,
      exposure: 1.2,
      shadows: true,
    },
  },
  8: {
    name: "Golden Hour",
    background: 0xffd7a1,

    hemi: {
      sky: 0xffe0b2,
      ground: 0x5a3b1a,
      intensity: 1.2,
    },

    dir: {
      color: 0xffc27a,
      intensity: 2.0,
      position: [-4, 5, 3],
      shadow: {
        enabled: true,
      },
    },

    renderer: {
      toneMapping: THREE.ACESFilmicToneMapping,
      exposure: 1.1,
      shadows: true,
    },
  },
  9: {
    name: "Morning",
    background: 0xbfdfff,

    hemi: {
      sky: 0xdbeeff,
      ground: 0x9aa7b2,
      intensity: 1.3,
    },

    dir: {
      color: 0xe6f2ff,
      intensity: 1.5,
      position: [3, 6, 2],
      shadow: {
        enabled: true,
      },
    },

    renderer: {
      toneMapping: THREE.ACESFilmicToneMapping,
      exposure: 1.0,
      shadows: true,
    },
  },
};
