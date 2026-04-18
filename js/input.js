window.addEventListener("mousemove", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / (window.innerHeight + 58)) * 2 + 1;

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
const brickButtonsDiv = document.getElementById("brickButtons");
Object.keys(BRICKS).forEach((id) => {
  const btn = document.createElement("button");
  btn.textContent = BRICKS[id].name;
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
  btn.onclick = () => {
    currentColor = color;
    updatePreview();
    updateActive();
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
    const c = parseInt(btn.style.background.slice(1), 16);
    btn.classList.toggle("active", c === currentColor);
  });
}
updateActive();
