const thumbnailRenderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  preserveDrawingBuffer: true
});

const thumbnailSize = 64;
thumbnailRenderer.setSize(thumbnailSize, thumbnailSize);

let previewItem = null;
const thumbnailScene = buildEmptyScene();

const thumbDist = 2;
const thumbRatio = thumbnailSize / thumbnailSize;

const thumbnailCamera = new THREE.OrthographicCamera(-thumbDist * thumbRatio, thumbDist * thumbRatio, thumbDist, -thumbDist, 0.1, 1000);
thumbnailCamera.position.set(2, 2, 2);
thumbnailCamera.lookAt(0, 0, 0);

function renderBrickPreview(brickFactory) {
  
  previewItem = brickFactory();
  thumbnailScene.add(previewItem);

  thumbnailCamera.updateProjectionMatrix();

  thumbnailRenderer.render(thumbnailScene, thumbnailCamera);

  thumbnailScene.remove(previewItem);

  const dataURL = thumbnailRenderer.domElement.toDataURL();

  return dataURL;
}
