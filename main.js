/* SCENE */
const scene = new THREE.Scene();

/* CAMERA */
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
camera.position.z = 3;

/* RENDERER */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.domElement.style.position = "fixed";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";
renderer.domElement.style.zIndex = "0";
document.body.appendChild(renderer.domElement);

/* LIGHTS */
scene.add(new THREE.AmbientLight(0x222222));
const sun = new THREE.DirectionalLight(0xffffff, 1.5);
sun.position.set(5, 3, 5);
scene.add(sun);

/* STARS */
const starsGeo = new THREE.BufferGeometry();
const starPos = [];
for (let i = 0; i < 12000; i++) {
  starPos.push(
    (Math.random() - 0.5) * 3000,
    (Math.random() - 0.5) * 3000,
    (Math.random() - 0.5) * 3000
  );
}
starsGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
scene.add(
  new THREE.Points(
    starsGeo,
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 })
  )
);

/* EARTH */
const earth = new THREE.Mesh(
  new THREE.SphereGeometry(1, 64, 64),
  new THREE.MeshPhongMaterial({
    map: new THREE.TextureLoader().load("./assets/earth_daymap.jpg")
  })
);
scene.add(earth);

/* ATMOSPHERE */
const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(1.05, 64, 64),
  new THREE.MeshBasicMaterial({
    color: 0x4fc3f7,
    transparent: true,
    opacity: 0.12
  })
);
scene.add(atmosphere);

/* ANIMATION LOOP */
function animate() {
  requestAnimationFrame(animate);
  earth.rotation.y += 0.0006;
  renderer.render(scene, camera);
}
animate();

/* RESIZE */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
