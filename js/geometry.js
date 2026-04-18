function createFlatRingGeometry(outerRadius, innerRadius, height) {
  if (innerRadius >= outerRadius) {
    throw new Error("innerRadius must be smaller than outerRadius");
  }

  const shape = new THREE.Shape();

  // Outer circle
  shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);

  // Inner hole
  const hole = new THREE.Path();
  hole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);

  shape.holes.push(hole);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: false,
    curveSegments: 16,
  });

  // Center it vertically so it extrudes around origin
  geometry.translate(0, 0, -height / 2);

  geometry.rotateX(-Math.PI / 2);

  geometry.computeVertexNormals();

  return geometry;
}

function createLEGODishGeometry({
  radius = 1,
  depth = 0.3,
  segments = 48
} = {}) {

  const pts = [];
  const bowlSteps = 12;

  let lastY = 0;

  for (let i = 0; i <= bowlSteps; i++) {
    const t = i / bowlSteps;
    const r = radius * t;

    const y = -depth * Math.pow(t, 2.3) + 0.15;

    lastY = y;
    pts.push(new THREE.Vector2(r, y));
  }

  // Hard edge (duplicate point)
  pts.push(new THREE.Vector2(radius, lastY));
  pts.push(new THREE.Vector2(radius, lastY));

  // rim drop
  pts.push(new THREE.Vector2(radius, -depth));

  const geo = new THREE.LatheGeometry(pts, segments);

  geo.computeVertexNormals();

  return geo;
}

function addBase() {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x555555 });

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(gridSize, 1 / 3, gridSize),
    mat,
  );
  base.position.y = -studH;
  base.receiveShadow = true;

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const stud = new THREE.Mesh(studGeo, mat);
      stud.position.set(
        i - gridSize / 2 + 0.5, 
        studH * 0.5,
        j - gridSize / 2 + 0.5);
      stud.castShadow = true;
      stud.receiveShadow = true;
      group.add(stud);
    }
  }

  group.add(base);

  return group;
}
