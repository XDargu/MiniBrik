window.addEventListener("mousemove", (e) => {
  const rect = renderer.domElement.getBoundingClientRect();

  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  updatePreviewPos();
});

window.addEventListener("click", (e) => {
  if (isBuilding) return;

  if (e.target.closest("#ui")) return;
  if (e.target.closest("#topbar")) return;
  if (e.target.closest("#controls")) return;

  const { x, z, y, valid } = previewState;
  if (!valid) return;

  placeBlock(currentBrick, x, y, z, rotation, currentColor);
  playFromPool(soundPools.place)

  updateShareURL();
  updatePreview();
  updatePreviewPos();
});

// UI
function initUI() {

  window.addEventListener("keydown", (e) => {
   if (e.key.toLowerCase() === "r") {
     rotation = (rotation + 90) % 360;
     updatePreview();
     updatePreviewPos();
   }
   if (e.key.toLowerCase() === "c") {
     const currentIdx = COLORS.indexOf(currentColor);
     currentColor = COLORS[(currentIdx + 1) % COLORS.length];
     updatePreview();
     updateActive();
     updateThumbnailsColor();
   }
   if (e.key.toLowerCase() === "e") {
     blockOffset = blockOffset + 1;
     updatePreview();
     updatePreviewPos();
   }
   if (e.key.toLowerCase() === "z")
   {
     if (undo())
         playFromPool(soundPools.remove)
   }
   if (e.key.toLowerCase() === "y")
   {
     if (redo())
         playFromPool(soundPools.place)
   }
  });

  const brickButtonsDiv = document.getElementById("brickButtons");
  const presetButtonsDiv = document.getElementById("presetButtons");

  brickButtonsDiv.addEventListener('wheel', (e) => {
    e.preventDefault(); // stop page vertical scroll
    brickButtonsDiv.scrollLeft += e.deltaY; // vertical wheel → horizontal movement
    }, { passive: false }
  );

  Object.keys(BRICKS).forEach((id) => {
    const def = BRICKS[id];

    const btn = document.createElement("button");
    btn.dataset.brickId = id;

    btn.classList.add("brick-button")
    const span = document.createElement("span");
    span.textContent = def.name;

    const img = document.createElement("img");
    
    btn.appendChild(span);
    btn.appendChild(img);
    btn.onclick = () => {
      currentBrick = id;
      blockOffset = 0;
      updatePreview();
      updateActive();
    };
    brickButtonsDiv.appendChild(btn);
  });

  const colorButtonsDiv = document.getElementById("colorButtons");

  COLORS.forEach((color) => {
    const btn = document.createElement("button");
    btn.style.background = `#${color.toString(16).padStart(6, "0")}`;
    if (color == 0xffc94a || color == 0xe74c3d)
    {
        btn.style.boxShadow = `0px 0px 10px 3px #${color.toString(16).padStart(6, "0")}`;
    }
    btn.dataset.color = color;
    btn.onclick = () => {
      currentColor = color;
      updatePreview();
      updateActive();
      updateThumbnailsColor();
    };
    colorButtonsDiv.appendChild(btn);
  });

  Object.keys(LIGHT_PRESETS).forEach((key) => {
    const preset = LIGHT_PRESETS[key];

    const btn = document.createElement("button");
    btn.textContent = preset.name;
    btn.dataset.preset = key;

    btn.onclick = () => {
      globalSettings.lightPreset = key;

      transitionToPreset(scene, renderer, preset);
      updateActive();
      updateShareURL();
    };

    presetButtonsDiv.appendChild(btn);
  });

  function updateActive() {
    [...brickButtonsDiv.children].forEach((btn) =>
      btn.classList.toggle(
        "active",
        btn.textContent === BRICKS[currentBrick].name,
      ),
    );
    [...colorButtonsDiv.children].forEach((btn) => {
      const c = btn.dataset.color;
      btn.classList.toggle("active", c == currentColor);
    });
    [...presetButtonsDiv.children].forEach((btn) => {
      btn.classList.toggle(
        "active",
        btn.dataset.preset == globalSettings.lightPreset
      );
    });
  }

  let thumbnailCache = new Map();

  function updateThumbnailsColor()
  {
    [...brickButtonsDiv.children].forEach((btn) =>
    {
      const def = BRICKS[btn.dataset.brickId];
      const img = btn.querySelector("img");
      const thumbnailKey = `${btn.dataset.brickId}-${currentColor}`;

      let thumbnailUrl = thumbnailCache.get(thumbnailKey);
      if (!thumbnailUrl)
      {
        thumbnailUrl = renderBrickPreview(() => createBrick(def.w, def.d, def.h, 0, currentColor, def.type, def.hollowStud).group );
        thumbnailCache.set(thumbnailKey, thumbnailUrl);
      }
      thumbnailCache.get()
      img.src = thumbnailUrl;

    });
  }

  // Examples
  const examples = [
    {
      name: "Living Room",
      data: "VQcAAIuQCQyJXgEAi14JBImQEQiJkBkIiZAhCImeEQiJnhkIiZ4hCIWSEQyFmBEMhFApAIReKQCLkEEMi15BBIOUKQSDmikEqZVJCKmbSQimU1EMpFtRDKZXaQymU4EMpFNpDKRbgQyBTgEEgU4ZBIFOMQSKTkkEik5RBNCMWQROjXEMgqIBDIKiGQyCojEMi6JJDIuiUQyEYlkAhGhZAIRocQCEYnEAi2iJBItokQTPppkEEKaxBARnWQQEZ3EEg44CBINOAwSDWgMEg5oCBIuaGgSLThsMihobBIrOGgyDjiIMg04jDIOaIgyDWiMMi846DIsaOwSKmjoEik47DOjgAgzo5gIM6OADDOjmAwzopgQM6IgEDOjIAwzooAQM6JQEDOjUAwznyAsM5YgMCOWmDAjn5gsE55gMBOagDAToogQE5KIMDObmCgDm4AoA6OICAOTiCgziyCMA4swjAOLQIwDi1CMA4tgjAOLcIwDi4CMA4uQjAOJmIwTi5iIE56Y8COekPATmjjwE5ZQ8BOzgOgzsIDsM7GA7DOygOwzs5DoA7GQ7AOzkOwTsJDwE7GQ8BOzgOwTsIDwE7GA8BOwcPAjsWjwM7No7AOwYPADs1jsM7BY8AOzUOwDsVDwE7BI8COxQPAjsTjwI7M47DOzMOwDsyjsA7Ew8BOxIPAjtyDsI7OZSAOxmUwDs5lMA7KZUBOyiVATsnlQE7JpUBOyWVATskFQE7IxUBO2SVATtiFQE7WZUBOZcRAzmUkQM5khEDOlcXAzpYFwM6VZcDOlSXAzpTFwM6UhcDOxIZAzsTGQM7FZkDOxSZAzsYGQM7FxkDKwZQwgvFEMIL9BCCEnTIgRJEyMESRkjCEkZKwiFWBEMhVgpDIVSEQyFUikMSJcpDEiXMQyomSkMiJ0pDEiTKQztWUkA8GKZAM9jsQDyYskA"
    },
    {
      name: "Small House",
      data: "VQgAAAbdAwAGHQIABh0BAAfdAAQHiwQIB4sCCAPNAAgGQwEMBoMBAAaDAgAGiQMEB8sYDAeLHAwEmxwMBt0YAAbdGQAGCxkABwsaAAQLHAAEHRwAA9sYAAPdGgAD3RsAFN0yAAWdNAQEXTQIBUUZDAWFGwwHQxkABEMbAAfdMAQG3TEIBZ0yCAeLNAgFkTQMA400DAfLMAADy0gEBdNIBAbbSAQGnUoIBp1JCAWdTAgEmUwMBJFMDAOVTAwEi0wMBkMxDAaDMwwHgzEAE5lkBBORZAQTz2AEBktJBAaLSwQHg0sIB0tLCAedYggG0WAMBNlgDARDSQAFy0sABJ1kBARdZAgDC0kIB8tiCAWLZAgGy2MIBoNjDAZDYQwGg2EABoNiAAOTZABD3wQAQ98cAEPfNABD30wAQ99kAEPffABDnwAAQ58YAEOfMABDn0gAQ59gAEOfeABI35QISJ-QCEmdfAxJHXwMSZ17DEkdewxJnXoMSR16DEmdeQxJHXkMSF18DEjdewxIXXsMSN16DEhdegxI3XkMSF15DEjdeAxHn4QIR5-CCEOJAAhDiRgIQ4kwCEOJSAhDiWAIQ4l4CEPJBAhDyRwIQ8k0CEPJTAhDyWQIQ8l8CEjJlAhIiZAISdt4CEnXeAhJ03gISc94CEnLeAhJm3wASZd8AEmTfABJj3wASYt8AEiNfABIkXwASJV8AEiZfABI2XgASNV4AEjReABIzXgAR4uADESbgAxE24QMR8uEDEkLeQRJS3wESct7BEgLfARECYEIRsmDAEuDeQxLA3oMS4N6DEsDewxLg3sMR0mBAERJgwBLRYEASkWCAEoFgwBJR4kASceJAElHigBJx4oASUeLAAxCgQAMRIkADEaRAAzCgQAMxIkADMaRAAxGkgAMRIoADEKCAAzGkgAMxIoADMKCAAxGkwAMRIsADEKDAIJdhASHlYQIh9WAAIfTgACHk4QIgt2DBIJdgwSC3YIEgl2CBILdgQSCXYEEgt2ABIILgQxJS3sASct6AElLegBJy3kASUt5AIKLhAyCC4QMgouDDIILgwyCi4IMgguCDIKLgQxDnwIIQ58aCEOfMghDn0oIQ59iCEMfBAhDHxwIQx80CEMfTAhDH2QIgMmcBIDfnACAn5gMgImYCIKLmAyCl5gMgt-YAILfmQCC35oAgt-bAILdnASC1ZwEgM2cBICTmAyCzZgEgomcCIILmgiCi5sIgIuaCIKftASCybQMgtG0DIKJswCCibIAgomxAIKJsACCX7QIgl-zCIJfsgiCX7EIgs2wDILVsAyCC8kMgovMDIKTzAyCncwIgp3LCIKdygiC28gAgkvJAIJLygCCS8sAgtnIBIIb5ASCm-MEghvjBIKb4gSCG-IEgpvhBIIb4QSCTeQMgs3jDIJN4wyCzeIMgk3iDILN4QyCTeEMgo_5DIJX-QCCV_oAglf7AILV-wSCkfsIgpH6CILREQ2CURINgtESDYJREw2C0RMNgtMpAYLTKgGEyQMEhAkEBIRJBASBSRwI6kg0COpgAgjqoAEIQSEKCERfCgxAXwkMSt4hAEoeIQBQoCkAUB4qAFBgKgBQHikACB5CAGhgQgAooEEAaB5BAEQbAABEGQAARFsYBEQbGARMWzAITFkwCESXAAhElQAITJUYDExVGAzpjjQASM48AAjORABO2QQATtkcAEPXBADt1hwA7dg0AO0aNQDt2jQA7Rg1AERT_AREURQJRFMUCUQRLA1EUSwNRBNEAUQRRAFOEVwBThF0AekQjAHpEowBDBKUBQxSlAU"
    },
    {
      name: "Parked Car",
      data: "VQIAAEOJGgBDiTIAQ4lKAEOJAwBDiRsAQ4kzAEOJSwBUiWIAsckBAM_JYQCyyXkApKUEAKSlHACk5QIApOUaAKSZBACkmRwApNkCAKTZGgDmogQE5uICBOeaBAjlogMI5WIECIJjGwiCmxoAhp8aAIJbHACCYRwAhl8cAIHfGwSBoRsAhZsbDOQbNQzkITUMxKEyDMSbMgyDnzIMh6UyAIeZMgCFmTQAhaU0AIMfNQCLpUoEiyVLBIpZSwyK2UoMiiVTBIqlUgSLWVMMi9lSDIsZTQyLmUwMi9lLDIrlTASKZUwEiuVLBIkZTAyJpUsEhB80BIgfTASIHUwEg1lbCINZcwiDZVsIg2VzCIVaWwyFYnMEhGJbBIRccwSGWYsMhWWLBIaZUwCGmVQAhqVTAIalVACCI1UEhBtVAILlbASCZWwEgqVrBIEZbQyBmWwMgRlsDIWZawyFJWwEgpmDAIKdgwCCoYMAhqWDAIEbhQiBH4UIgSWFCIUhhQjxZKMIr1ltCK9lbQg"
    },
    {
      name: "Savanna",
      data: "VQgAAA5gAgAOYhoMDqIaAA5gGggOoBoEDmIyBA5iSgQO4gIEDl4CBA5mAgQO4gEEDmJiBA5iegQOYpIEDmKqBA4iwgQOZNoEDqLCBA7g2gQO4NkEDh7yBA5m8gQJXvMICZ77CAmcAw0J3gsJCSLbCAkk4wQJZOsICSYKAQnmEQEJaBIFCWoaBQnmCgkJ6BIFCaDxAAlg-QAJIAEBCaIBBQkaCg0JGBINCRYaDQkUIg0J2hkBCZohAQmcKQUJmDENCdzyDAmcCgkJmhINCZ4aBQmgIgUJmBoNCZYiDQnaIgkJGisJQSAJDUGYOQlBlioFQd4TAUGk8wxBbCIJQSgbDUKgKg1CFCoJQaYZBUFaMw1BWiINQZ7xBEEk2ghB4vIIQdr6AEScMQlJ2jINSWDaBEmcCwFJ5hoFSSYaDUkk8gxJaAsNSaQLAUngKw1KokIBSuQxCUoiIQlKnDoJSpBBDUqSQgFK7jkFSmwzCSuQAQQrDgIEK9ICCCtOAwgrxAIMK8oDCCtQAwwrzAMMKw4EACsMBAQrxgMITokKCE4JCghORQIITsUKCE5DAwhOxQsITkcMCE5JDABOjwwETtEMAE5TBABO0wsETpcDBE4ZCwROEwsMTpMKDE4RCgxOjwkETosJCE5NAQxOkQkMTkUiDElFGghJgyIMT8sJDE-TCwxPUQwMkYkLDJEJDAyRRQsMkckKDA9EawwPRIMMD4hrDA_IagwPyIIMDwhsDA8IhAxThwEIU8MBDE6NIQhJTxkETpEhBE9PIQRQxyEEUIUqBFYLAQhWBwEMSlUCAFPXCghT2QIIU5sDBFMXBARJzQQISYkEDFPJBAxThwQAVEEEDE4DJAxPRSQMT4UEDA8VAgwTEwEED4khBA-BAwQPQxsECYMCABPBAghSIBsIUqQyCE8kAwhPJBsIUR4DCFFiAwhOoAMIT6QDCEggBAhI4DIISCYDCEiiAwhJZAMMSKgDDGieGwxw4jIMVA0FAA"
    }
  ];
  const select = document.getElementById("exampleSelect");

  examples.forEach((ex, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = ex.name;
    select.appendChild(opt);
  });
  
  select.addEventListener("change", (e) => {
    const idx = e.target.value;
    if (idx === "") return;
  
    const build = examples[idx];
  
    window.location.hash = build.data;
  
    const state = decodeState(build.data);
    loadState(state);
    updateActive();
  });

  const clearBtn = document.getElementById("clearBuild");

  clearBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear the build?"))
    {
        loadState({ settings: defaultGlobalSettings, bricks: [] });
        updateShareURL();
        updateActive();
    }
  });

  // UI toggle
  const uiBtn = document.getElementById("uiToggle");
  
  let isUIHidden = false;
  uiBtn.addEventListener("click", async () => {
    isUIHidden = !isUIHidden;
  
    if (isUIHidden) {
      document.body.classList.toggle("hide-ui", true);
      uiBtn.textContent = "Show UI";
    } else {
      document.body.classList.toggle("hide-ui", false);
      uiBtn.textContent = "Hide UI";
    }
  });

  // Orbit toggle
  const orbitBtn = document.getElementById("orbitToggle");
  
  orbitBtn.addEventListener("click", async () => {
    let isOrbiting = toggleIdleOrbit();
  
    if (isOrbiting) {
      orbitBtn.textContent = "Orbit: on";
    } else {
      orbitBtn.textContent = "Orbit: off";
    }
  });

  // Audio toggle
  let audioEnabled = true;

  const audioBtn = document.getElementById("audioToggle");
  
  audioBtn.addEventListener("click", async () => {
    audioEnabled = !audioEnabled;
  
    if (audioEnabled) {
      await THREE.AudioContext.getContext().resume?.();
      audioBtn.textContent = "Sound: on";
    } else {
      await THREE.AudioContext.getContext().suspend?.();
      audioBtn.textContent = "Sound: off";
    }
  });
  
  updateActive();
  updateThumbnailsColor();
}