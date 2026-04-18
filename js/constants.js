// We assume lego height is 1
const gap = 0.02;
const shift = 0.007;
const studH = 0.177;
const studGeo=new THREE.CylinderGeometry(0.25, 0.25, studH, 16);
const hollowStudGeo = createFlatRingGeometry(0.25, 0.15, studH);
const dishGeo = createLEGODishGeometry();

const gridSize = 24;
const GRID_HALF = gridSize / 2; // 10