const aspect = window.innerWidth / window.innerHeight;
const distance = 20;

function setupCamera()
{
    let radius = 30;
    let theta = Math.PI/4;
    let phi = Math.PI/4;

    const camera = new THREE.OrthographicCamera(-distance * aspect, distance * aspect, distance, -distance, 0.1, 1000);

    // camera controls
    let dragging = false;
    let prevX = 0;
    let prevY = 0;

    function updateCamera() {
        camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
        camera.position.y = radius * Math.cos(phi);
        camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
        camera.lookAt(0, 0, 0);
    }
    updateCamera();

    // zoom (orthographic)
    window.addEventListener("wheel", (e) => {
        const factor = e.deltaY < 0 ? 1.1 : 0.9;
        camera.zoom *= factor;
        camera.zoom = Math.max(0.5, Math.min(5, camera.zoom));
        camera.updateProjectionMatrix();
    });

    window.addEventListener("mousedown", (e) => {
        if (e.button === 2) {
            dragging = true;
            prevX = e.clientX;
            prevY = e.clientY;
        }
    });

    window.addEventListener("mouseup", () => (dragging = false));
    window.addEventListener("mousemove", (e) => {
        if (!dragging) return;

        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        prevX = e.clientX;
        prevY = e.clientY;

        theta -= dx * 0.005;
        phi -= dy * 0.005;

        phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));

        updateCamera();
    });
    
    window.addEventListener("resize", () => {
        const aspect = window.innerWidth / window.innerHeight;
        camera.left = -distance * aspect;
        camera.right = distance * aspect;
        camera.top = distance;
        camera.bottom = -distance;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return camera;

}