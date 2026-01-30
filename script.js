const globeContainer = document.getElementById("globe-container");
const targetsList = document.getElementById("targets-list");
const feedList = document.getElementById("feed-list");

const todayEl = document.getElementById("count-today");
const activeEl = document.getElementById("count-active");
const peakEl = document.getElementById("count-peak");

let liveAttacks = [];
let totalToday = 0;
let attacksThisMinute = [];
let peakPerMinute = 0;

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
  .pointsData([])
  .pointLat(d => d.lat)
  .pointLng(d => d.lng)
  .pointColor(d => d.color)
  .pointRadius(d => d.radius)
  .pointAltitude(0.01)
  .pointResolution(8)
  .pointOpacity(0.9)
  .pointBlendMode("add")
  .pointOfView({ lat: 20, lng: 0, altitude: 2.25 })
  (globeContainer);

globe.controls().autoRotate = true;
globe.controls().autoRotateSpeed = 0.32;

/* ================= HEAT MAP ================= */
function updateHeatMap() {
  const counts = {};
  liveAttacks.forEach(a => {
    counts[a.target] = (counts[a.target] || 0) + 1;
  });

  const heatPoints = Object.entries(counts).map(([country, value]) => {
    const loc = LOCATIONS.find(l => l.country === country);
    return {
      lat: loc.lat,
      lng: loc.lng,
      radius: Math.min(0.6, 0.15 + value * 0.08),
      color: value > 4 ? "#ff4d4f" :
             value > 2 ? "#faad14" :
                         "#36cfc9"
    };
  });

  globe.pointsData(heatPoints);
}

/* ================= PANELS ================= */
function updateTopTargets() {
  const counts = {};
  liveAttacks.forEach(a => {
    counts[a.target] = (counts[a.target] || 0) + 1;
  });

  targetsList.innerHTML = "";
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([country, count]) => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${country}</span><span>${count}</span>`;
      targetsList.appendChild(li);
    });
}

function addToFeed(attack) {
  const li = document.createElement("li");
  const time = new Date(attack.time).toLocaleTimeString();
  li.innerHTML = `[${time}] <span style="color:${attack.color}">${attack.type}</span> | ${attack.source} → ${attack.target}`;
  feedList.prepend(li);
  if (feedList.children.length > 20) feedList.removeChild(feedList.lastChild);
}

/* ================= COUNTERS ================= */
function updateCounters() {
  totalToday++;
  todayEl.textContent = totalToday;
  activeEl.textContent = liveAttacks.length;

  const now = Date.now();
  attacksThisMinute.push(now);
  attacksThisMinute = attacksThisMinute.filter(t => now - t < 60000);

  if (attacksThisMinute.length > peakPerMinute) {
    peakPerMinute = attacksThisMinute.length;
    peakEl.textContent = peakPerMinute;
  }
}

/* ================= ATTACK GENERATOR ================= */
function generateAttack() {
  const attack = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
  let from = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  let to = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  while (from === to) to = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

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

/* ================= LOOP ================= */
setInterval(() => {
  const attack = generateAttack();
  liveAttacks.push(attack);
  if (liveAttacks.length > 18) liveAttacks.shift();

  globe.arcsData(liveAttacks);
  updateHeatMap();
  updateTopTargets();
  addToFeed(attack);
  updateCounters();
}, 2000);
