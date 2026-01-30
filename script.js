const globeContainer = document.getElementById("globe-container");

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

globe.controls().autoRotate = true;
globe.controls().autoRotateSpeed = 0.35;

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

setInterval(() => {
  liveAttacks.push(generateAttack());
  if (liveAttacks.length > 60) liveAttacks.shift();
  globe.arcsData(liveAttacks);
}, 1000);
