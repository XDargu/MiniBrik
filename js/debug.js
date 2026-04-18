const debugMat=new THREE.MeshStandardMaterial({
    color: 0xff0000, 
    transparent: true, 
    opacity: 0.5, 
    roughness: 0.8,
  });
const debugGeom = new THREE.BoxGeometry(1, 0.3, 1)
let occupiedDebug = [];
function debugOccupy(){
  
  
    for (let b of occupiedDebug)
      scene.remove(b);

    for(let x=-GRID_HALF; x<GRID_HALF; x++) {
        for(let y=-GRID_HALF; y<GRID_HALF; y++) {
            for(let z=-GRID_HALF; z<GRID_HALF; z++) {
                if (isOccupied(x, y, z))
                {
                    let body=new THREE.Mesh(debugGeom, debugMat);
                    body.position.set(x+0.5,y/3 + 0.166,z+0.5);
                    scene.add(body);
                    occupiedDebug.push(body)
                }
            }
        }
    }
}
//setInterval(debugOccupy, 300);