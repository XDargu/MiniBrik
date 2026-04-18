const skyColor = 0xB1E1FF;  // light blue
const groundColor = 0xB97A20;  // brownish orange
const intensity = 2;

function buildEmptyScene(renderer)
{
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x196c89);

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true
    document.body.appendChild(renderer.domElement);


    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.shadow.camera.left = -10;
    dirLight.shadow.camera.right = 10;
    dirLight.shadow.camera.bottom = -10;
    dirLight.shadow.camera.top = 10;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.camera.updateProjectionMatrix();
    dirLight.position.set(-10,20,10);
    dirLight.castShadow = true
    scene.add(dirLight);

    return scene;
}