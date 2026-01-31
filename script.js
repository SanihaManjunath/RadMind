const globeContainer = document.getElementById("globe-container");
const targetsList = document.getElementById("targets-list");
const feedList = document.getElementById("feed-list");

const todayEl = document.getElementById("count-today");
const activeEl = document.getElementById("count-active");
const peakEl = document.getElementById("count-peak");

/* ================= METRICS ================= */
let totalToday = 0;
let attacksThisMinute = [];
let peakPerMinute = 0;

/* ================= REGION ALERTS (DEDUPED) ================= */
const regionAlerts = {};

/* ================= GLOBE ================= */
const globe = Globe()
  .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-night.jpg")
  .backgroundImageUrl("https://unpkg.com/three-globe/example/img/night-sky.png")

  /* PROFESSIONAL LINES */
  .arcsData(liveAttacks)
  .arcColor(d => d.color)
  .arcOpacity(0.55)
  .arcStroke(0.25)
  .arcAltitude(0.28)
  .arcDashLength(0.06)
  .arcDashGap(1.2)
  .arcDashAnimateTime(2200)

  /* REGION ALERT RINGS */
  .ringsData([])
  .ringColor(d => d.color)
  .ringMaxRadius(d => d.radius)
  .ringPropagationSpeed(2)
  .ringRepeatPeriod(900)

  .pointOfView({ lat: 20, lng: 0, altitude: 2.4 })
  (globeContainer);

globe.controls().autoRotate = true;
globe.controls().autoRotateSpeed = 0.25;
globe.renderer().setPixelRatio(window.devicePixelRatio);

/* ================= REGION ALERT LOGIC ================= */
function addRegionAlert(attack) {
  const key = attack.target;
  const now = Date.now();

  if (!regionAlerts[key]) {
    regionAlerts[key] = {
      lat: attack.endLat,
      lng: attack.endLng,
      intensity: 1,
      color: attack.color,
      lastUpdate: now
    };
  } else {
    regionAlerts[key].intensity = Math.min(
      regionAlerts[key].intensity + 0.6,
      4
    );
    regionAlerts[key].lastUpdate = now;
  }

  updateRings();
}

/* decay + cleanup */
function updateRings() {
  const now = Date.now();
  const rings = [];

  Object.keys(regionAlerts).forEach(key => {
    const r = regionAlerts[key];
    r.intensity *= 0.92;

    if (r.intensity < 0.25) {
      delete regionAlerts[key];
    } else {
      rings.push({
        lat: r.lat,
        lng: r.lng,
        radius: 1.4 + r.intensity * 0.7,
        color: r.color
      });
    }
  });

  globe.ringsData(rings);
}

setInterval(updateRings, 1200);

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

  li.innerHTML = `
    <span class="feed-time">[${time}]</span>
    <span class="feed-type" style="color:${attack.color}">
      ${attack.type}
    </span>
    | ${attack.source} → ${attack.target}
  `;

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

/* ================= LIVE LOOP ================= */
setInterval(() => {
  const attack = generateAttack();
  liveAttacks.push(attack);
  if (liveAttacks.length > 25) liveAttacks.shift();

  globe.arcsData(liveAttacks);
  addRegionAlert(attack);
  updateTopTargets();
  addToFeed(attack);
  updateCounters();
}, 1600);
