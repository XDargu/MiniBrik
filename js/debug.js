const debugMat=new THREE.MeshStandardMaterial({
    color: 0xff0000, 
    transparent: true, 
    opacity: 0.5, 
    roughness: 0.8,
  });
let occupiedDebug = [];
function debugOccupy(){
  
  
    for (let b of occupiedDebug)
      scene.remove(b);

    for(let x=-gridSize; x<gridSize; x++) {
        for(let y=-gridSize; y<gridSize; y++) {
            for(let z=-gridSize; z<gridSize; z++) {
                if (isOccupied(x, y, z))
                {
                    let body=new THREE.Mesh(new THREE.BoxGeometry(1, 1.3, 1), debugMat);
                    body.position.set(x+0.5,y+0.5,z+0.5);
                    scene.add(body);
                    occupiedDebug.push(body)
                }
            }
        }
    }
}
//setInterval(debugOccupy, 300);