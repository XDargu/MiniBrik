window.addEventListener("mousemove", (e) => {
  const rect = renderer.domElement.getBoundingClientRect();

  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  updatePreviewPos();
});

window.addEventListener("click", (e) => {
  if (isBuilding) return;

  if (e.target.closest("#ui")) return;

  const { x, z, y, valid } = previewState;
  if (!valid) return;

  placeBlock(currentBrick, x, y, z, rotation, currentColor);

  updateShareURL();
  updatePreview();
  updatePreviewPos();
});

window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "r") {
    rotation = (rotation + 90) % 360;
    updatePreview();
    updatePreviewPos();
  }
  if (e.key.toLowerCase() === "z") undo();
  if (e.key.toLowerCase() === "y") redo();
});

// UI
function initUI() {
  const brickButtonsDiv = document.getElementById("brickButtons");

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
      updatePreview();
      updateActive();
    };
    brickButtonsDiv.appendChild(btn);
  });

  const colorButtonsDiv = document.getElementById("colorButtons");

  COLORS.forEach((color) => {
    const btn = document.createElement("button");
    btn.style.background = `#${color.toString(16).padStart(6, "0")}`;
    btn.dataset.color = color;
    btn.onclick = () => {
      currentColor = color;
      updatePreview();
      updateActive();
      updateThumbnailsColor();
    };
    colorButtonsDiv.appendChild(btn);
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
  }

  function updateThumbnailsColor()
  {
    [...brickButtonsDiv.children].forEach((btn) =>
    {
      const def = BRICKS[btn.dataset.brickId];
      const img = btn.querySelector("img")
      img.src = renderBrickPreview(
        () =>
          createBrick(def.w, def.d, def.h, 0, currentColor, def.type, def.hollowStud).group,
      );

    });
  }
  
  updateActive();
  updateThumbnailsColor();
}