const globeContainer = document.getElementById("globe-container");

/* Create globe */
const globe = Globe()
  .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-night.jpg")
  .backgroundImageUrl("https://unpkg.com/three-globe/example/img/night-sky.png")
  .arcsData(liveAttacks)
  .arcColor(d => d.color)
  .arcStroke(1.5)
  .arcDashLength(0.6)
  .arcDashGap(4)
  .arcDashAnimateTime(3500)
  .pointOfView({ lat: 20, lng: 0, altitude: 2.4 })
  (globeContainer);

/* Rotation */
globe.controls().autoRotate = true;
globe.controls().autoRotateSpeed = 0.35;

/* ===== ARROWHEAD SUPPORT ===== */
const arrowGroup = new THREE.Group();
globe.scene().add(arrowGroup);

/* Create arrowhead at destination */
function addArrowHead(attack) {
  const radius = globe.getGlobeRadius();

  const start = globe.getCoords(attack.startLat, attack.startLng, radius);
  const end = globe.getCoords(attack.endLat, attack.endLng, radius);

  const direction = new THREE.Vector3().subVectors(end, start).normalize();

  const geometry = new THREE.ConeGeometry(0.6, 2.2, 12);
  const material = new THREE.MeshBasicMaterial({ color: attack.color });
  const arrow = new THREE.Mesh(geometry, material);

  arrow.position.copy(end);

  // Align arrow toward destination
  arrow.lookAt(start);
  arrow.rotateX(Math.PI);

  arrowGroup.add(arrow);

  // Remove after animation
  setTimeout(() => {
    arrowGroup.remove(arrow);
    geometry.dispose();
    material.dispose();
  }, 4000);
}

/* Generate attack */
function generateAttack() {
  const attack = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
  let from = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  let to = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

  while (from === to) {
    to = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  }

  return {
    startLat: from.lat,
    startLng: from.lng,
    endLat: to.lat,
    endLng: to.lng,
    color: attack.color,
    type: attack.name,
    time: Date.now()
  };
}

/* Live update loop */
setInterval(() => {
  const attack = generateAttack();
  liveAttacks.push(attack);

  if (liveAttacks.length > 60) liveAttacks.shift();

  globe.arcsData(liveAttacks);
  addArrowHead(attack);
}, 1000);
