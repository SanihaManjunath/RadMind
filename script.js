const globeContainer = document.getElementById("globe-container");
const targetsList = document.getElementById("targets-list");
const feedList = document.getElementById("feed-list");

/* ================= GLOBE ================= */
const globe = Globe()
  .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-night.jpg")
  .backgroundImageUrl("https://unpkg.com/three-globe/example/img/night-sky.png")
  .arcsData(liveAttacks)
  .arcColor(d => d.color)
  .arcStroke(1.4)
  .arcAltitude(0.25)
  .arcDashLength(0.55)
  .arcDashGap(4)
  .arcDashAnimateTime(3200)
  .pointOfView({ lat: 20, lng: 0, altitude: 2.25 })
  (globeContainer);

globe.controls().autoRotate = true;
globe.controls().autoRotateSpeed = 0.32;

/* ================= TOP TARGETS ================= */
function updateTopTargets() {
  const counts = {};

  liveAttacks.forEach(a => {
    counts[a.target] = (counts[a.target] || 0) + 1;
  });

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  targetsList.innerHTML = "";

  sorted.forEach(([country, count]) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${country}</span><span>${count}</span>`;
    targetsList.appendChild(li);
  });
}

/* ================= LIVE FEED ================= */
function addToFeed(attack) {
  const li = document.createElement("li");
  const time = new Date(attack.time).toLocaleTimeString();

  li.innerHTML = `
    <span class="feed-time">[${time}]</span>
    <span class="feed-type" style="color:${attack.color}">
      ${attack.type}
    </span>
    <span>
      | ${attack.source} → ${attack.target}
    </span>
  `;

  feedList.prepend(li);

  // Keep feed clean
  if (feedList.children.length > 20) {
    feedList.removeChild(feedList.lastChild);
  }
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
    source: from.country,
    target: to.country,
    color: attack.color,
    type: attack.name,
    time: Date.now()
  };
}

/* ================= LIVE LOOP ================= */
setInterval(() => {
  const attack = generateAttack();
  liveAttacks.push(attack);

  if (liveAttacks.length > 18) liveAttacks.shift();

  globe.arcsData(liveAttacks);
  updateTopTargets();
  addToFeed(attack);
}, 1000);
