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
document.body.appendChild(renderer.domElement);

/* STARFIELD */
const starsGeometry = new THREE.BufferGeometry();
const stars = [];
for (let i = 0; i < 12000; i++) {
  stars.push(
    (Math.random() - 0.5) * 2000,
    (Math.random() - 0.5) * 2000,
    (Math.random() - 0.5) * 2000
  );
}
starsGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(stars, 3)
);
scene.add(
  new THREE.Points(
    starsGeometry,
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
  new THREE.SphereGeometry(1.03, 64, 64),
  new THREE.MeshBasicMaterial({
    color: 0x4fc3f7,
    transparent: true,
    opacity: 0.18
  })
);
scene.add(atmosphere);

/* LIGHTING */
const sun = new THREE.DirectionalLight(0xffffff, 1.3);
sun.position.set(5, 3, 5);
scene.add(sun);
scene.add(new THREE.AmbientLight(0x222222));

/* GEO UTILS */
function latLongToVector3(lat, lon, radius = 1) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta)
  );
}

/* CYBER ARC (GLOW + ARROW) */
function createCyberArc(start, end, color) {
  const startVec = latLongToVector3(...start);
  const endVec = latLongToVector3(...end);

  const mid = startVec.clone().add(endVec).multiplyScalar(0.5);
  mid.normalize().multiplyScalar(1.5);

  const curve = new THREE.QuadraticBezierCurve3(startVec, mid, endVec);
  const points = curve.getPoints(120);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  // Glow layer
  const glow = new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.35
    })
  );
  glow.scale.set(1.02, 1.02, 1.02);

  // Core arc
  const arc = new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 1
    })
  );

  scene.add(glow);
  scene.add(arc);

  // Arrow head
  const arrow = new THREE.Mesh(
    new THREE.ConeGeometry(0.035, 0.12, 12),
    new THREE.MeshBasicMaterial({ color })
  );
  scene.add(arrow);

  let t = 0;
  function animateArrow() {
    t += 0.006;
    if (t >= 1) {
      scene.remove(glow);
      scene.remove(arc);
      scene.remove(arrow);
      return;
    }

    const current = curve.getPointAt(t);
    const next = curve.getPointAt(Math.min(t + 0.01, 1));

    arrow.position.copy(current);
    arrow.lookAt(next);

    requestAnimationFrame(animateArrow);
  }
  animateArrow();
}

/* LIVE ATTACK COLORS */
const COLORS = [
  "#ff1744", // DDoS
  "#ffca28", // Phishing
  "#ab47bc", // Malware
  "#29b6f6", // Brute Force
  "#66bb6a"  // Ransomware
];

/* SPAWN LIVE ATTACKS */
function spawnAttack() {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];

  const start = [
    Math.random() * 180 - 90,
    Math.random() * 360 - 180
  ];
  const end = [
    Math.random() * 180 - 90,
    Math.random() * 360 - 180
  ];

  createCyberArc(start, end, color);
}

/* CONTINUOUS FLOW */
setInterval(spawnAttack, 600);

/* ANIMATION LOOP */
function animate() {
  requestAnimationFrame(animate);
  earth.rotation.y += 0.0007;
  atmosphere.rotation.y += 0.0007;
  renderer.render(scene, camera);
}
animate();

/* RESIZE */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
