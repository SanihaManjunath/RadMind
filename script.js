const globeContainer = document.getElementById("globe-container");

/* ================= GLOBE ================= */
const globe = Globe()
  .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-night.jpg")
  .backgroundImageUrl("https://unpkg.com/three-globe/example/img/night-sky.png")

  /* ATTACK ARCS */
  .arcsData(liveAttacks)
  .arcColor(d => d.color)
  .arcStroke(1.8)
  .arcDashLength(0.55)
  .arcDashGap(4)
  .arcDashAnimateTime(3500)

  /* 🔥 IMPACT RINGS (VISIBLE COUNTRY GLOW) */
  .ringsData([])
  .ringLat(d => d.lat)
  .ringLng(d => d.lng)
  .ringColor(d => d.color)
  .ringMaxRadius(d => d.maxRadius)
  .ringAltitude(0.04)                 // ⬅ LIFT ABOVE EARTH
  .ringPropagationSpeed(3)            // ⬅ FAST PULSE
  .ringRepeatPeriod(600)

  .pointOfView({ lat: 20, lng: 0, altitude: 2.3 })
  (globeContainer);

/* ROTATION */
globe.controls().autoRotate = true;
globe.controls().autoRotateSpeed = 0.35;

/* ================= ARROWHEADS ================= */
const arrowGroup = new THREE.Group();
globe.scene().add(arrowGroup);

function addArrowHead(attack) {
  const radius = globe.getGlobeRadius();

  const start = globe.getCoords(attack.startLat, attack.startLng, radius);
  const end = globe.getCoords(
    attack.endLat,
    attack.endLng,
    radius + 2.2     // ⬅ FLOAT ABOVE GLOBE
  );

  const geometry = new THREE.ConeGeometry(1.3, 4.8, 18);
  const material = new THREE.MeshStandardMaterial({
    color: attack.color,
    emissive: attack.color,
    emissiveIntensity: 1.4
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

/* ================= COUNTRY GLOW ================= */
let impactRings = [];

function addCountryGlow(attack) {
  const ring = {
    lat: attack.endLat,
    lng: attack.endLng,
    color: attack.color,
    maxRadius: 6.5    // ⬅ MUCH MORE VISIBLE
  };

  impactRings.push(ring);
  globe.ringsData(impactRings);

  setTimeout(() => {
    impactRings = impactRings.filter(r => r !== ring);
    globe.ringsData(impactRings);
  }, 1400);
}

/* ================= ATTACK GENERATOR ================= */
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

/* ================= LIVE LOOP ================= */
setInterval(() => {
  const attack = generateAttack();
  liveAttacks.push(attack);

  if (liveAttacks.length > 50) liveAttacks.shift();

  globe.arcsData(liveAttacks);
  addArrowHead(attack);
  addCountryGlow(attack);
}, 1000);
