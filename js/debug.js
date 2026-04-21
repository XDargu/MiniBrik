function initDebug()
{
    const debugMat=new THREE.MeshStandardMaterial({
        color: 0xff0000, 
        transparent: true, 
        opacity: 0.5, 
        roughness: 0.8,
        emissive: 0xff0000,
        emissiveIntensity: 1,
    });
    const debugMatCurr=new THREE.MeshStandardMaterial({
        color: 0x00ff00, 
        transparent: true, 
        opacity: 0.5, 
        roughness: 0.8,
        emissive: 0x00ff00,
        emissiveIntensity: 1,
    });
    const debugGeom = new THREE.BoxGeometry(1, 0.3, 1)

    const MAX_CELLS = 5000;

    let occupiedMesh = new THREE.InstancedMesh(debugGeom, debugMat, MAX_CELLS);
    let previewMesh  = new THREE.InstancedMesh(debugGeom, debugMatCurr, MAX_CELLS);

    scene.add(occupiedMesh);
    scene.add(previewMesh);

    let dummy = new THREE.Object3D();

    function debugOccupy() {

        if (!occupiedMesh.parent) {
            scene.add(occupiedMesh);
        }
        if (!previewMesh.parent) {
            scene.add(previewMesh);
        }

        let occupiedCount = 0;
        let previewCount = 0;

        const { x, z, y } = previewState;
        const [w, d] = getFootprint(currentBrick, rotation);
        const baseCells = getOccupancy(x, y, z, w, d, BRICKS[currentBrick].h, rotation);

        // Preview cells
        for (let cell of baseCells) {
            dummy.position.set(
                cell.x + 0.5,
                cell.y / 3 + 0.166,
                cell.z + 0.5
            );
            dummy.updateMatrix();
            previewMesh.setMatrixAt(previewCount++, dummy.matrix);
        }

        // Occupied cells
        for (let x = -GRID_HALF; x < GRID_HALF; x++) {
            for (let y = 0; y < 127; y++) {
                for (let z = -GRID_HALF; z < GRID_HALF; z++) {
                    if (isOccupied(x, y, z)) {
                        dummy.position.set(
                            x + 0.5,
                            y / 3 + 0.166,
                            z + 0.5
                        );
                        dummy.updateMatrix();
                        occupiedMesh.setMatrixAt(occupiedCount++, dummy.matrix);
                    }
                }
            }
        }

        occupiedMesh.count = occupiedCount;
        previewMesh.count = previewCount;

        occupiedMesh.instanceMatrix.needsUpdate = true;
        previewMesh.instanceMatrix.needsUpdate = true;

    }
    setInterval(debugOccupy, 300);
}

//initDebug();