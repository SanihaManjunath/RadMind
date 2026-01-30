const globeContainer = document.getElementById("globe-container");

/* ===== GLOBE ===== */
const globe = Globe()
  .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-night.jpg")
  .backgroundImageUrl("https://unpkg.com/three-globe/example/img/night-sky.png")

  /* ATTACK ARCS */
  .arcsData(liveAttacks)
  .arcColor(d => d.color)
  .arcStroke(1.6)
  .arcDashLength(0.55)
  .arcDashGap(4)
  .arcDashAnimateTime(3500)

  /* IMPACT RINGS (COUNTRY GLOW) */
  .ringsData([])
  .ringLat(d => d.lat)
  .ringLng(d => d.lng)
  .ringColor(d => d.color)
  .ringMaxRadius(d => d.maxRadius)
  .ringPropagationSpeed(2)
  .ringRepeatPeriod(700)

  .pointOfView({ lat: 20, lng: 0, altitude: 2.35 })
  (globeContainer);

/* ROTATION */
globe.controls().autoRotate = true;
globe.controls().autoRotateSpeed = 0.35;

/* ===== ARROWHEADS ===== */
const arrowGroup = new THREE.Group();
globe.scene().add(arrowGroup);

function addArrowHead(attack) {
  const radius = globe.getGlobeRadius();

  const start = globe.getCoords(attack.startLat, attack.startLng, radius);
  const end = globe.getCoords(
    attack.endLat,
    attack.endLng,
    radius + 1.8   // FLOAT ABOVE EARTH
  );

  const geometry = new THREE.ConeGeometry(1.1, 4.2, 16);
  const material = new THREE.MeshStandardMaterial({
    color: attack.color,
    emissive: attack.color,
    emissiveIntensity: 1.2
  });

  const arrow = new THREE.Mesh(geometry, material);
  arrow.position.copy(end);
  arrow.lookAt(start);
  arrow.rotateX(Math.PI);

  arrowGroup.add(arrow);

  setTimeout(() => {
    arrowGroup.remove(arrow);
    geometry.dispose();
    material.dispose();
  }, 4200);
}

/* ===== COUNTRY GLOW (RING) ===== */
let impactRings = [];

function addCountryGlow(attack) {
  const ring = {
    lat: attack.endLat,
    lng: attack.endLng,
    color: attack.color,
    maxRadius: 4.5
  };

  impactRings.push(ring);
  globe.ringsData(impactRings);

  setTimeout(() => {
    impactRings = impactRings.filter(r => r !== ring);
    globe.ringsData(impactRings);
  }, 1500);
}

/* ===== ATTACK GENERATOR ===== */
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

/* ===== LIVE LOOP ===== */
setInterval(() => {
  const attack = generateAttack();
  liveAttacks.push(attack);

  if (liveAttacks.length > 55) liveAttacks.shift();

  globe.arcsData(liveAttacks);
  addArrowHead(attack);
  addCountryGlow(attack);
}, 1000);
