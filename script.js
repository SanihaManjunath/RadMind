const globeContainer = document.getElementById("globe-container");

/* Globe */
const globe = Globe()
  .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-night.jpg")
  .backgroundImageUrl("https://unpkg.com/three-globe/example/img/night-sky.png")

  /* Arcs */
  .arcsData(liveAttacks)
  .arcColor(d => d.color)
  .arcStroke(1.5)
  .arcDashLength(0.6)
  .arcDashGap(4)
  .arcDashAnimateTime(3500)

  /* Country glow points */
  .pointsData(impactPoints)
  .pointLat(d => d.lat)
  .pointLng(d => d.lng)
  .pointColor(d => d.color)
  .pointRadius(d => d.radius)
  .pointAltitude(0.02)

  .pointOfView({ lat: 20, lng: 0, altitude: 2.4 })
  (globeContainer);

/* Rotation */
globe.controls().autoRotate = true;
globe.controls().autoRotateSpeed = 0.35;

/* Arrowheads */
const arrowGroup = new THREE.Group();
globe.scene().add(arrowGroup);

function addArrowHead(attack) {
  const radius = globe.getGlobeRadius();
  const start = globe.getCoords(attack.startLat, attack.startLng, radius);
  const end = globe.getCoords(attack.endLat, attack.endLng, radius);

  const geometry = new THREE.ConeGeometry(0.6, 2.2, 12);
  const material = new THREE.MeshBasicMaterial({ color: attack.color });
  const arrow = new THREE.Mesh(geometry, material);

  arrow.position.copy(end);
  arrow.lookAt(start);
  arrow.rotateX(Math.PI);

  arrowGroup.add(arrow);

  setTimeout(() => {
    arrowGroup.remove(arrow);
    geometry.dispose();
    material.dispose();
  }, 4000);
}

/* Glow pulse */
function addImpactGlow(attack) {
  const glow = {
    lat: attack.endLat,
    lng: attack.endLng,
    color: attack.color,
    radius: 0.1
  };

  impactPoints.push(glow);
  globe.pointsData(impactPoints);

  const pulse = setInterval(() => {
    glow.radius += 0.05;
    globe.pointsData(impactPoints);
  }, 60);

  setTimeout(() => {
    clearInterval(pulse);
    impactPoints = impactPoints.filter(p => p !== glow);
    globe.pointsData(impactPoints);
  }, 1200);
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

/* Live loop */
setInterval(() => {
  const attack = generateAttack();
  liveAttacks.push(attack);

  if (liveAttacks.length > 60) liveAttacks.shift();

  globe.arcsData(liveAttacks);
  addArrowHead(attack);
  addImpactGlow(attack);
}, 1000);
